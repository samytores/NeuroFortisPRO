/**
 * GitHub API Integration for Content Publishing
 * This script provides functions to interact with the GitHub API for content publishing
 */

class GitHubAPIClient {
    constructor(config) {
        this.config = config;
        this.baseUrl = config.api.baseUrl || 'https://api.github.com';
        this.owner = config.repository.owner;
        this.repo = config.repository.repo;
        this.branch = config.repository.branch || 'main';
        this.token = null; // Token should be set by the user's tool
    }

    /**
     * Set the authentication token
     * @param {string} token - GitHub Personal Access Token
     */
    setToken(token) {
        this.token = token;
    }

    /**
     * Get the headers for API requests
     * @returns {Object} - Headers object
     */
    getHeaders() {
        const headers = {
            'Accept': 'application/vnd.github+json',
            'X-GitHub-Api-Version': this.config.api.version || '2022-11-28'
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        return headers;
    }

    /**
     * Get repository content
     * @param {string} path - Path to the content
     * @returns {Promise} - Promise resolving to content data
     */
    async getContent(path) {
        const endpoint = this.config.api.endpoints.get_content
            .replace('{owner}', this.owner)
            .replace('{repo}', this.repo)
            .replace('{path}', path);

        const url = `${this.baseUrl}${endpoint}`;
        
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: this.getHeaders()
            });

            if (!response.ok) {
                throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching content:', error);
            throw error;
        }
    }

    /**
     * Create or update a file in the repository
     * @param {string} path - Path where the file should be created/updated
     * @param {string} content - Content of the file
     * @param {string} message - Commit message
     * @param {string} sha - SHA of the file (required for updates, not for creation)
     * @returns {Promise} - Promise resolving to the result of the operation
     */
    async createOrUpdateFile(path, content, message, sha = null) {
        const endpoint = this.config.api.endpoints.create_or_update_file
            .replace('{owner}', this.owner)
            .replace('{repo}', this.repo)
            .replace('{path}', path);

        const url = `${this.baseUrl}${endpoint}`;
        
        // Content must be base64 encoded for the GitHub API
        const encodedContent = btoa(unescape(encodeURIComponent(content)));
        
        const body = {
            message,
            content: encodedContent,
            branch: this.branch
        };

        // If SHA is provided, it's an update operation
        if (sha) {
            body.sha = sha;
        }

        try {
            const response = await fetch(url, {
                method: 'PUT',
                headers: this.getHeaders(),
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error creating/updating file:', error);
            throw error;
        }
    }

    /**
     * Get a list of files in a directory
     * @param {string} path - Directory path
     * @returns {Promise} - Promise resolving to array of files
     */
    async getDirectoryContents(path) {
        return this.getContent(path);
    }

    /**
     * Create a new blog post
     * @param {Object} postData - Blog post data
     * @returns {Promise} - Promise resolving to the result of the operation
     */
    async createBlogPost(postData) {
        // Get the blog template
        const templatePath = this.config.content_types.blog.template;
        const templateContent = await this.getFileContent(templatePath);
        
        // Replace template placeholders with actual content
        let postContent = templateContent;
        for (const [key, value] of Object.entries(postData)) {
            if (typeof value === 'string') {
                const regex = new RegExp(`{{${key}}}`, 'g');
                postContent = postContent.replace(regex, value);
            } else if (Array.isArray(value)) {
                // Handle arrays (like tags)
                // This is a simplified implementation
                const regex = new RegExp(`{{#each ${key}}}([\\s\\S]*?){{/each}}`, 'g');
                const matches = postContent.match(regex);
                
                if (matches && matches.length > 0) {
                    const templateBlock = matches[0];
                    const itemTemplate = templateBlock.replace(`{{#each ${key}}}`, '').replace(`{{/each}}`, '');
                    
                    let replacementContent = '';
                    for (const item of value) {
                        let itemContent = itemTemplate;
                        itemContent = itemContent.replace(/{{this}}/g, item);
                        replacementContent += itemContent;
                    }
                    
                    postContent = postContent.replace(templateBlock, replacementContent);
                }
            }
        }
        
        // Create the blog post file
        const postPath = `${this.config.content_paths.blog_posts}${postData.slug}.html`;
        return this.createOrUpdateFile(postPath, postContent, `Add blog post: ${postData.title}`);
    }

    /**
     * Get file content as text
     * @param {string} path - File path
     * @returns {Promise<string>} - Promise resolving to file content
     */
    async getFileContent(path) {
        const data = await this.getContent(path);
        
        // If it's a directory, throw an error
        if (Array.isArray(data)) {
            throw new Error('Path points to a directory, not a file');
        }
        
        // Decode content from base64
        const content = atob(data.content);
        return content;
    }
}

// Export the class for use in other scripts
window.GitHubAPIClient = GitHubAPIClient;
