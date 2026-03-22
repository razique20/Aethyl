// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title Aethyl
 * @dev FrethiX is a decentralized freelance platform with escrow-backed payments (a product of Aethyl).
 * Includes a bidding system for freelancers, decentralized blogs, and admin moderation.
 */
contract Aethyl {
    address public owner;
    mapping(address => bool) public admins;

    enum JobStatus { Created, Assigned, Funded, Completed, Canceled, Disputed }

    struct Quote {
        uint256 id;
        address freelancer;
        uint256 amountUSD;
        uint256 durationInDays;
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
        uint256 durationInDays; // Accepted duration
        uint256 deadline;       // block.timestamp + duration (set when funded)
        uint256 extensionRequestDays;
        string extensionReason;
        bool hasExtensionRequest;
    }

    struct UserProfile {
        string name;
        string bio;
        string skills;
        string location;
        bool exists;
        bool isBanned;
        uint256 completedJobs;
        uint256 totalAssignedJobs;
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

    struct Dispute {
        uint256 jobId;
        uint256 clientVotes;
        uint256 freelancerVotes;
        string evidenceURI;
        bool isResolved;
    }

    struct Review {
        uint256 id;
        address reviewer;
        address reviewee;
        uint256 jobId;
        uint8 rating; // 1-5 stars
        string comment;
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

    // Reputation System: Reviews for a user
    mapping(address => Review[]) public reviews;
    // Track if a user has reviewed a specific job
    mapping(uint256 => mapping(address => bool)) public hasReviewed;

    // Dispute Resolution
    mapping(address => bool) public jurors;
    mapping(uint256 => Dispute) public disputes;
    mapping(uint256 => mapping(address => bool)) public jurorHasVoted;

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
    event ReviewSubmitted(uint256 indexed jobId, address indexed reviewer, address indexed reviewee, uint8 rating);
    event ExtensionRequested(uint256 indexed jobId, uint256 additionalDays, string reason);
    event ExtensionApproved(uint256 indexed jobId, uint256 newDeadline);
    event DisputeRaised(uint256 indexed jobId, address indexed raiser, string evidenceURI);
    event JurorVoted(uint256 indexed jobId, address indexed juror, bool favorFreelancer);
    event DisputeResolved(uint256 indexed jobId, string winner);
    event JurorAdded(address indexed juror);
    event JurorRemoved(address indexed juror);

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

    function addJuror(address _juror) external onlyAdmin {
        jurors[_juror] = true;
        emit JurorAdded(_juror);
    }

    function removeJuror(address _juror) external onlyAdmin {
        jurors[_juror] = false;
        emit JurorRemoved(_juror);
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
            skills: _skills,
            durationInDays: 0,
            deadline: 0,
            extensionRequestDays: 0,
            extensionReason: "",
            hasExtensionRequest: false
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
        UserProfile storage profile = profiles[msg.sender];
        if (!profile.exists) {
            registeredUsers.push(msg.sender);
            profile.exists = true;
        }
        
        profile.name = _name;
        profile.bio = _bio;
        profile.skills = _skills;
        profile.location = _location;

        emit ProfileUpdated(msg.sender, _name);
    }

    /**
     * @dev Submit a quote for a job.
     */
    function submitQuote(uint256 _jobId, uint256 _amountUSD, uint256 _durationInDays, string calldata _bidText, string[] calldata _workLinks) external notBanned {
        require(jobs[_jobId].status == JobStatus.Created, "Job is not open for bidding");
        require(msg.sender != jobs[_jobId].client, "Client cannot bid on their own job");
        require(_durationInDays > 0, "Duration must be at least 1 day");
        require(_workLinks.length <= 5, "Maximum 5 links allowed");

        Quote memory newQuote = Quote({
            id: jobQuotes[_jobId].length,
            freelancer: msg.sender,
            amountUSD: _amountUSD,
            durationInDays: _durationInDays,
            bidText: _bidText,
            workLinks: _workLinks
        });

        jobQuotes[_jobId].push(newQuote);
        emit QuoteSubmitted(_jobId, msg.sender, _amountUSD);
    }

    /**
     * @dev Assign a freelancer to a job based on their selection.
     */
    function assignFreelancer(uint256 _jobId, address _freelancer, uint256 _quoteId) external notBanned {
        Job storage job = jobs[_jobId];
        require(job.client == msg.sender, "Only the client can assign a freelancer");
        require(job.status == JobStatus.Created, "Job already assigned");
        require(!profiles[_freelancer].isBanned, "Selected freelancer is banned");
        require(_quoteId < jobQuotes[_jobId].length, "Invalid quote ID");
        require(jobQuotes[_jobId][_quoteId].freelancer == _freelancer, "Freelancer mismatch for quote");
        
        job.freelancer = _freelancer;
        job.durationInDays = jobQuotes[_jobId][_quoteId].durationInDays;
        job.status = JobStatus.Assigned;
        profiles[_freelancer].totalAssignedJobs++;

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
        job.deadline = block.timestamp + (job.durationInDays * 1 days);

        emit JobFunded(_jobId, msg.value);
    }

    /**
     * @dev Request an extension for a job deadline.
     */
    function requestExtension(uint256 _jobId, uint256 _additionalDays, string calldata _reason) external notBanned {
        Job storage job = jobs[_jobId];
        require(job.freelancer == msg.sender, "Only freelancer can request extension");
        require(job.status == JobStatus.Funded, "Job must be funded");
        require(_additionalDays > 0, "Must request at least 1 day");

        job.extensionRequestDays = _additionalDays;
        job.extensionReason = _reason;
        job.hasExtensionRequest = true;

        emit ExtensionRequested(_jobId, _additionalDays, _reason);
    }

    /**
     * @dev Approve a requested extension.
     */
    function approveExtension(uint256 _jobId) external notBanned {
        Job storage job = jobs[_jobId];
        require(job.client == msg.sender, "Only client can approve extension");
        require(job.hasExtensionRequest, "No extension request found");

        job.deadline += (job.extensionRequestDays * 1 days);
        job.hasExtensionRequest = false;
        job.extensionRequestDays = 0;
        job.extensionReason = "";

        emit ExtensionApproved(_jobId, job.deadline);
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
        profiles[job.freelancer].completedJobs++;

        (bool success, ) = payable(job.freelancer).call{value: payment}("");
        require(success, "Payment failed");

        emit JobCompleted(_jobId, job.freelancer, payment);
    }

    /**
     * @dev Raise a dispute for a funded job.
     */
    function raiseDispute(uint256 _jobId, string calldata _evidenceURI) external notBanned {
        Job storage job = jobs[_jobId];
        require(msg.sender == job.client || msg.sender == job.freelancer, "Only participant can raise dispute");
        require(job.status == JobStatus.Funded, "Job must be in Funded status");

        job.status = JobStatus.Disputed;
        disputes[_jobId] = Dispute({
            jobId: _jobId,
            clientVotes: 0,
            freelancerVotes: 0,
            evidenceURI: _evidenceURI,
            isResolved: false
        });

        emit DisputeRaised(_jobId, msg.sender, _evidenceURI);
    }

    /**
     * @dev Vote on a dispute.
     */
    function voteOnDispute(uint256 _jobId, bool _favorFreelancer) external notBanned {
        require(jurors[msg.sender] || admins[msg.sender], "Only jurors or admins can vote");
        Job storage job = jobs[_jobId];
        require(job.status == JobStatus.Disputed, "Job is not in Disputed status");
        require(!jurorHasVoted[_jobId][msg.sender], "Already voted on this dispute");

        Dispute storage dispute = disputes[_jobId];
        if (_favorFreelancer) {
            dispute.freelancerVotes++;
        } else {
            dispute.clientVotes++;
        }
        jurorHasVoted[_jobId][msg.sender] = true;

        emit JurorVoted(_jobId, msg.sender, _favorFreelancer);

        // Resolution Threshold: 3 votes (can be any N)
        if (dispute.clientVotes >= 3 || dispute.freelancerVotes >= 3) {
            _resolveDispute(_jobId);
        }
    }

    /**
     * @dev Internal: Resolve a dispute based on votes.
     */
    function _resolveDispute(uint256 _jobId) internal {
        Job storage job = jobs[_jobId];
        Dispute storage dispute = disputes[_jobId];
        require(!dispute.isResolved, "Already resolved");

        dispute.isResolved = true;
        uint256 amount = job.amount;
        job.amount = 0;

        if (dispute.freelancerVotes > dispute.clientVotes) {
            // Freelancer wins
            job.status = JobStatus.Completed;
            profiles[job.freelancer].completedJobs++;
            (bool success, ) = payable(job.freelancer).call{value: amount}("");
            require(success, "Payment failed");
            emit DisputeResolved(_jobId, "Freelancer");
        } else {
            // Client wins
            job.status = JobStatus.Canceled;
            (bool success, ) = payable(job.client).call{value: amount}("");
            require(success, "Refund failed");
            emit DisputeResolved(_jobId, "Client");
        }
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
     * @dev Submit a review for a completed job.
     */
    function submitReview(uint256 _jobId, uint8 _rating, string calldata _comment) external notBanned {
        Job storage job = jobs[_jobId];
        require(job.status == JobStatus.Completed, "Only completed jobs can be reviewed");
        require(_rating >= 1 && _rating <= 5, "Rating must be between 1 and 5");
        require(!hasReviewed[_jobId][msg.sender], "Already reviewed this job");

        address reviewee;
        if (msg.sender == job.client) {
            reviewee = job.freelancer;
        } else if (msg.sender == job.freelancer) {
            reviewee = job.client;
        } else {
            revert("Only client or freelancer can review");
        }

        uint256 reviewId = reviews[reviewee].length;
        reviews[reviewee].push(Review({
            id: reviewId,
            reviewer: msg.sender,
            reviewee: reviewee,
            jobId: _jobId,
            rating: _rating,
            comment: _comment,
            timestamp: block.timestamp
        }));

        hasReviewed[_jobId][msg.sender] = true;
        emit ReviewSubmitted(_jobId, msg.sender, reviewee, _rating);
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

    /**
     * @dev Returns all reviews for a user.
     */
    function getUserReviews(address _user) external view returns (Review[] memory) {
        return reviews[_user];
    }
}
