const express = require('express');
const cors = require('cors');
const axios = require('axios');
const lodash = require('lodash');

const port = 5000;
const app = express();
app.use(cors());
app.use(express.json());

app.listen(port, () => {
    console.log(`Server is listening on port: ${port}`);
});

async function getBlogData(req, res, next) {
    const config = {
        method: 'get',
        url: 'https://intent-kit-16.hasura.app/api/rest/blogs',
        headers: {
          'x-hasura-admin-secret': '32qR4KmXOIpsGPQKMqEJHGJS27G5s7HdSKO3gdtQd2kv5e852SiYwWNfxkZOBuQ6'
        }
      };

    try {
        const axiosResponse = await axios(config);
        req.blogs = axiosResponse.data.blogs;
        next();
    }
    catch(error) {
        res.status(500).json({ error: 'Failed to fetch blog data from external API' });
    }
}

app.get('/api/blog-stats', getBlogData, (req, res) => {

    try {
        const blogs = req.blogs;
        const numberOfBlogs = lodash.size(blogs);
        const longestTitle = lodash.maxBy(blogs, 'title.length');

        const uniqueTitleBlogs = lodash.uniqBy(blogs, (blog) => {
            return blog.title.toLowerCase();
        });
        const uniqueTitles = lodash.map(uniqueTitleBlogs, 'title');

        const privacyInTitle = lodash.filter(uniqueTitleBlogs, (blog) => {
            return blog.title.toLowerCase().includes('privacy');
        });
        const numberWithPrivacyInTitle = privacyInTitle.length;
        
        res.json({
            numberOfBlogs,
            longestTitle,
            numberWithPrivacyInTitle,
            uniqueTitles,
        });
    }
    catch(error) {
        res.status(500).json({ error: 'An error occurred while processing blog data' });
    }
});

app.get('/api/blog-search', getBlogData, (req, res) => {
    try {
        const query = req.query.query.toLowerCase();
        const blogs = req.blogs;

        const filteredBlogs = lodash.filter(blogs, (blog) => {
            return blog.title.toLowerCase().includes(query);
        })

        res.json({
            filteredBlogs
        });
    }
    catch(error) {
        res.status(500).json({ error: 'An error occurred while filtering blog data' });
    }
});