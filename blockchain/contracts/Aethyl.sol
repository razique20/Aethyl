// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title Aethyl
 * @dev A decentralized freelance platform with escrow-backed payments.
 * Includes a bidding system for freelancers, decentralized blogs, and admin moderation.
 */
contract Aethyl {
    address public owner;
    mapping(address => bool) public admins;

    enum JobStatus { Created, Assigned, Funded, Completed, Canceled }

    struct Quote {
        uint256 id;
        address freelancer;
        uint256 amountUSD;
        string bidText;
        string[] workLinks;
    }

    struct Job {
        uint256 id;
        address client;
        address freelancer;
        uint256 amount;
        JobStatus status;
        string title;
        string description;
        string category;
        string skills;
    }

    struct UserProfile {
        string name;
        string bio;
        string skills;
        string location;
        bool exists;
        bool isBanned;
    }

    struct Blog {
        uint256 id;
        string title;
        string content;
        string author;
        string category;
        string imageURL;
        uint256 timestamp;
        bool isPublished;
    }

    struct Notification {
        uint256 id;
        string message;
        string notifType;
        uint256 timestamp;
    }

    uint256 public nextJobId;
    mapping(uint256 => Job) public jobs;
    uint256[] public jobIds;
    
    // Mapping from Job ID to an array of Quotes
    mapping(uint256 => Quote[]) public jobQuotes;

    // Mapping for User Profiles
    mapping(address => UserProfile) public profiles;
    address[] public registeredUsers;

    // Decentralized Blogs
    uint256 public nextBlogId;
    mapping(uint256 => Blog) public blogs;
    uint256[] public blogIds;

    // Decentralized Notifications
    mapping(address => Notification[]) public userNotifications;

    event JobCreated(uint256 jobId, address client, string title);
    event JobAssigned(uint256 jobId, address freelancer);
    event JobFunded(uint256 jobId, uint256 amount);
    event JobCompleted(uint256 jobId, address freelancer, uint256 amount);
    event JobCanceled(uint256 jobId, address client);
    event QuoteSubmitted(uint256 jobId, address freelancer, uint256 amountUSD);
    event ProfileUpdated(address indexed user, string name);
    event UserBanned(address indexed user, bool status);
    event BlogPublished(uint256 blogId, string title);
    event NotificationSent(address indexed user, string notifType);
    event AdminAdded(address indexed admin);
    event AdminRemoved(address indexed admin);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized: Owner only");
        _;
    }

    modifier onlyAdmin() {
        require(msg.sender == owner || admins[msg.sender], "Not authorized: Admin only");
        _;
    }

    modifier notBanned() {
        require(!profiles[msg.sender].isBanned, "Your account is banned");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function addAdmin(address _newAdmin) external onlyAdmin {
        admins[_newAdmin] = true;
        emit AdminAdded(_newAdmin);
    }

    function removeAdmin(address _admin) external onlyAdmin {
        require(_admin != owner, "Cannot remove the owner");
        admins[_admin] = false;
        emit AdminRemoved(_admin);
    }

    /**
     * @dev Create a new job listing (unassigned).
     */
    function createJob(
        string memory _title, 
        string memory _description,
        string memory _category,
        string memory _skills
    ) external notBanned returns (uint256) {
        uint256 jobId = nextJobId++;
        jobs[jobId] = Job({
            id: jobId,
            client: msg.sender,
            freelancer: address(0),
            amount: 0,
            status: JobStatus.Created,
            title: _title,
            description: _description,
            category: _category,
            skills: _skills
        });
        jobIds.push(jobId);

        emit JobCreated(jobId, msg.sender, _title);
        return jobId;
    }

    /**
     * @dev Update user profile.
     */
    function updateProfile(
        string memory _name, 
        string memory _bio, 
        string memory _skills, 
        string memory _location
    ) external notBanned {
        if (!profiles[msg.sender].exists) {
            registeredUsers.push(msg.sender);
        }
        
        profiles[msg.sender] = UserProfile({
            name: _name,
            bio: _bio,
            skills: _skills,
            location: _location,
            exists: true,
            isBanned: profiles[msg.sender].isBanned
        });
        emit ProfileUpdated(msg.sender, _name);
    }

    /**
     * @dev Submit a quote for a job.
     */
    function submitQuote(uint256 _jobId, uint256 _amountUSD, string calldata _bidText, string[] calldata _workLinks) external notBanned {
        require(jobs[_jobId].status == JobStatus.Created, "Job is not open for bidding");
        require(msg.sender != jobs[_jobId].client, "Client cannot bid on their own job");
        require(_workLinks.length <= 5, "Maximum 5 links allowed");

        Quote memory newQuote = Quote({
            id: jobQuotes[_jobId].length,
            freelancer: msg.sender,
            amountUSD: _amountUSD,
            bidText: _bidText,
            workLinks: _workLinks
        });

        jobQuotes[_jobId].push(newQuote);
        emit QuoteSubmitted(_jobId, msg.sender, _amountUSD);
    }

    /**
     * @dev Assign a freelancer to a job based on their selection.
     */
    function assignFreelancer(uint256 _jobId, address _freelancer) external notBanned {
        Job storage job = jobs[_jobId];
        require(job.client == msg.sender, "Only the client can assign a freelancer");
        require(job.status == JobStatus.Created, "Job already assigned");
        require(!profiles[_freelancer].isBanned, "Selected freelancer is banned");
        
        job.freelancer = _freelancer;
        job.status = JobStatus.Assigned;

        emit JobAssigned(_jobId, _freelancer);
    }

    /**
     * @dev Fund a specific job.
     */
    function fundJob(uint256 _jobId) external payable notBanned {
        Job storage job = jobs[_jobId];
        require(job.client == msg.sender, "Only client can fund");
        require(job.status == JobStatus.Assigned, "Job not assigned");
        require(msg.value > 0, "No fund amount");

        job.amount = msg.value;
        job.status = JobStatus.Funded;

        emit JobFunded(_jobId, msg.value);
    }

    /**
     * @dev Complete a job and release payment.
     */
    function completeJob(uint256 _jobId) external notBanned {
        Job storage job = jobs[_jobId];
        require(job.client == msg.sender, "Only client can approve");
        require(job.status == JobStatus.Funded, "Not funded");

        job.status = JobStatus.Completed;
        uint256 payment = job.amount;

        (bool success, ) = payable(job.freelancer).call{value: payment}("");
        require(success, "Payment failed");

        emit JobCompleted(_jobId, job.freelancer, payment);
    }

    /**
     * @dev Admin: Cancel a job and refund if funded.
     */
    function adminCancelJob(uint256 _jobId) external onlyAdmin {
        Job storage job = jobs[_jobId];
        require(job.status != JobStatus.Completed && job.status != JobStatus.Canceled, "Job already finalized");

        if (job.status == JobStatus.Funded) {
             uint256 refundAmount = job.amount;
             job.amount = 0;
             (bool success, ) = payable(job.client).call{value: refundAmount}("");
             require(success, "Refund failed");
        }

        job.status = JobStatus.Canceled;
        emit JobCanceled(_jobId, job.client);
    }

    /**
     * @dev Admin: Ban or unban a user.
     */
    function adminBanUser(address _user, bool _status) external onlyAdmin {
        profiles[_user].isBanned = _status;
        emit UserBanned(_user, _status);
    }

    /**
     * @dev Admin: Create a new decentralized blog post.
     */
    function createBlog(
        string memory _title, 
        string memory _content, 
        string memory _author, 
        string memory _category, 
        string memory _imageURL
    ) external onlyAdmin {
        uint256 blogId = nextBlogId++;
        blogs[blogId] = Blog({
            id: blogId,
            title: _title,
            content: _content,
            author: _author,
            category: _category,
            imageURL: _imageURL,
            timestamp: block.timestamp,
            isPublished: true
        });
        blogIds.push(blogId);
        emit BlogPublished(blogId, _title);
    }

    /**
     * @dev Admin: Edit an existing blog post.
     */
    function editBlog(
        uint256 _blogId,
        string memory _title,
        string memory _content,
        string memory _category,
        string memory _imageURL
    ) external onlyAdmin {
        require(_blogId < nextBlogId, "Blog does not exist");
        Blog storage blog = blogs[_blogId];
        blog.title = _title;
        blog.content = _content;
        blog.category = _category;
        blog.imageURL = _imageURL;
    }

    /**
     * @dev Admin: Toggle blog publication status (soft delete/hide).
     */
    function toggleBlogVisibility(uint256 _blogId) external onlyAdmin {
        require(_blogId < nextBlogId, "Blog does not exist");
        blogs[_blogId].isPublished = !blogs[_blogId].isPublished;
    }

    /**
     * @dev Admin: Send notification to a user.
     */
    function adminSendNotification(address _user, string memory _message, string memory _type) external onlyAdmin {
        uint256 notifId = userNotifications[_user].length;
        userNotifications[_user].push(Notification({
            id: notifId,
            message: _message,
            notifType: _type,
            timestamp: block.timestamp
        }));
        emit NotificationSent(_user, _type);
    }

    /**
     * @dev Returns all jobs.
     */
    function getAllJobs() external view returns (Job[] memory) {
        Job[] memory allJobs = new Job[](jobIds.length);
        for (uint256 i = 0; i < jobIds.length; i++) {
            allJobs[i] = jobs[jobIds[i]];
        }
        return allJobs;
    }

    /**
     * @dev Returns all quotes for a job.
     */
    function getJobQuotes(uint256 _jobId) external view returns (Quote[] memory) {
        return jobQuotes[_jobId];
    }

    /**
     * @dev Returns all registered user addresses.
     */
    function getAllUsers() external view returns (address[] memory) {
        return registeredUsers;
    }

    /**
     * @dev Returns all blogs.
     */
    function getAllBlogs() external view returns (Blog[] memory) {
        Blog[] memory allBlogs = new Blog[](blogIds.length);
        for (uint256 i = 0; i < blogIds.length; i++) {
            allBlogs[i] = blogs[blogIds[i]];
        }
        return allBlogs;
    }

    /**
     * @dev Returns notifications for a user.
     */
    function getNotifications(address _user) external view returns (Notification[] memory) {
        return userNotifications[_user];
    }
}
