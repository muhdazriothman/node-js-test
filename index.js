const express = require("express");
const app = express();
const fetch = require('node-fetch');
var bodyParser = require('body-parser');

app.use(bodyParser.json());

app.listen(3000, function () {
    console.log("App listening on port 3000!");
});

app.get("/getTopPost", async function (req, res) {

    const commentUrl = 'https://jsonplaceholder.typicode.com/comments';
    const postUrl = 'https://jsonplaceholder.typicode.com/posts';

    let commentList;
    let postList;

    commentList = await fetch(commentUrl)
        .then(res => res.json())
        .then((json) => {
            return json;
        });

    postList = await fetch(postUrl)
        .then(res => res.json())
        .then((json) => {
            return json;
        });

    // find post id occurence
    const groupCommentByPost = commentList.reduce((obj, comment) => {
        obj[comment.postId] = obj[comment.postId] + 1 || 1;
        return obj;
      }, {});


    let postWithHighestCommentList = [];
    let currentHighestValue = 0;

    for (const [key, value] of Object.entries(groupCommentByPost)) {
        let postWithHighestCommentObj = {};
        if (currentHighestValue < value) {
            currentHighestValue = value;
            // resets the list of highest comment
            if (postWithHighestCommentList.length > 0) {
                postWithHighestCommentList= [];
            } else {
                postWithHighestCommentObj.id = key;
                postWithHighestCommentObj.total_number_of_comments = value;
                postWithHighestCommentList.push(postWithHighestCommentObj);
            }
        } else if (currentHighestValue == value) {
            postWithHighestCommentObj.id = key;
            postWithHighestCommentObj.total_number_of_comments = value;
            postWithHighestCommentList.push(postWithHighestCommentObj);
        }
    }

    let response = [];

    
    // depending on response time from the feeder, might need to change to use promise all method
    // also depends on the list of post, if it is too large, will replace with promise all method
    for (const postWithHighestComment of postWithHighestCommentList) {
        // find post from list
        const postById = postList.find(a => a.id == postWithHighestComment.id);
        if (postById) {
            let returnObj = {};
            returnObj.post_id = postById.id;
            returnObj.post_title = postById.title;
            returnObj.post_body = postById.body;
            returnObj.total_number_of_comments = postWithHighestComment.total_number_of_comments;
            response.push(returnObj);
        }
    }

    res.send(response);
});


app.post("/filterComment", async function (req, res) {
    const requestPayload = req.body;

    const commentUrl = 'https://jsonplaceholder.typicode.com/comments';

    let commentList;

    commentList = await fetch(commentUrl)
        .then(res => res.json())
        .then((json) => {
            return json;
        });
        
    // get filter key
    const keyFromUrl = Object.keys(commentList[0]);

    let result = [...commentList];

    // only support and operator
    for (const [key, value] of Object.entries(requestPayload)) {
        // let result = [...commentList];
        if (keyFromUrl.includes(key)) {
            if (value) {
                const currentRegex = new RegExp(value);
                result = result.filter(a => currentRegex.test(a[key]));
                // result = result.filter(a => a[key] == value);
            }
        }
    }

    res.send(result);
});