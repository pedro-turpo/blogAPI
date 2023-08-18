const catchAsync = require('../utils/catchAsync');
const { Post, postStatus } = require('../models/post.model');
const User = require('../models/user.model');
const Comment = require('../models/comment.model');
const { db } = require('../database/config');
const PostImg = require('../models/postImg.model');

const storage = require('../utils/firebase');
const { ref, uploadBytes, getDownloadURL } = require('firebase/storage');
const crypto = require('node:crypto');

exports.findAllPosts = catchAsync(async (req, res, next) => {
  // hacer una funcionalidad para traerse los post del usuario en sesion;
  // deben incluir los comentarios de cada post y el usuario que hizo el comentario

  const posts = await Post.findAll({
    where: {
      status: 'active',
    },
    attributes: {
      exclude: ['status', 'userId'],
    },
    include: [
      {
        model: User,
        attributes: ['id', 'name', 'profileImgUrl', 'description'],
        where: {
          // tambien se puede poner condiciones
        },
      },
      {
        model: PostImg,
      },
    ],
  });

  const postPromises = posts.map(async (post) => {
    const imgRefUser = ref(storage, post.user.profileImgUrl);
    const urlUser = await getDownloadURL(imgRefUser);

    post.user.profileImgUrl = urlUser;

    const postImgsPromises = post.PostImgs.map(async (postImg) => {
      const imgRef = ref(storage, postImg.postImgUrl);
      const url = await getDownloadURL(imgRef);

      postImg.postImgUrl = url;
      return postImg;
    });

    const postImgsResolved = await Promise.all(postImgsPromises);
    post.PostImgs = postImgsResolved;

    return post;
  });

  await Promise.all(postPromises);

  return res.status(200).json({
    status: 'success',
    result: posts.length,
    posts,
  });
});

exports.findMyPosts = catchAsync(async (req, res, next) => {
  const { id: userId } = req.sessionUser;

  const posts = await Post.findAll({
    where: {
      status: postStatus.active,
      userId: userId,
    },
    include: [
      {
        model: PostImg,
      },
    ],
  });

  if (posts.length > 0) {
    const postPromises = posts.map(async (post) => {
      const postImgsPromises = post.PostImgs.map(async (postImg) => {
        const imgRef = ref(storage, postImg.postImgUrl);
        const url = await getDownloadURL(imgRef);

        postImg.postImgUrl = url;
        return postImg;
      });

      const postImgsResolved = await Promise.all(postImgsPromises);
      post.PostImg = postImgsResolved;

      return post;
    });

    await Promise.all(postPromises);
  }

  return res.status(200).json({
    status: 'success',
    results: posts.length,
    posts,
  });
});

exports.findUserPosts = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.query;

  const query = `SELECT id, title, content, "createdAt", "updatedAt"  FROM posts WHERE "userId" = :iduser AND status = :status`;

  const [rows, fields] = await db.query(query, {
    replacements: { iduser: id, status: status },
  });

  return res.status(200).json({
    status: 'success',
    results: fields.rowCount,
    posts: rows,
  });
});

exports.createPost = catchAsync(async (req, res, next) => {
  const { title, content } = req.body;
  const { id: userId } = req.sessionUser;

  const post = await Post.create({ title, content, userId });

  const postImgsPromises = req.files.map(async (file) => {
    const imgRef = ref(
      storage,
      `posts/${crypto.randomUUID()}-${file.originalname}`
    );
    const imgUploaded = await uploadBytes(imgRef, file.buffer);

    return await PostImg.create({
      postId: post.id,
      postImgUrl: imgUploaded.metadata.fullPath,
    });
  });

  await Promise.all(postImgsPromises);

  return res.status(200).json({
    status: 'success',
    message: 'The post has been created!',
    post,
  });
});

exports.findOnePost = catchAsync(async (req, res, next) => {
  const { post } = req;
  let postImgsPromises = [];
  let userImgsCommentPromises = [];

  const imgRefUserProfile = ref(storage, post.user.profileImgUrl);
  const urlUserProfile = await getDownloadURL(imgRefUserProfile);

  post.user.profileImgUrl = urlUserProfile;

  if (post.PostImgs?.length > 0) {
    postImgsPromises = post.PostImgs.map(async (postImg) => {
      const imgRef = ref(storage, postImg.postImgUrl);
      const url = await getDownloadURL(imgRef);

      postImg.postImgUrl = url;
      return postImg;
    });
  }

  if (post.comments?.length > 0) {
    userImgsCommentPromises = post.comments.map(async (comment) => {
      const imgRef = ref(storage, comment.user.profileImgUrl);
      const url = await getDownloadURL(imgRef);

      comment.user.profileImgUrl = url;
      return comment;
    });
  }

  const arrPromises = [...postImgsPromises, ...userImgsCommentPromises];
  await Promise.all(arrPromises);

  return res.status(200).json({
    status: 'success',
    post,
  });
});

exports.updatePost = catchAsync(async (req, res, next) => {
  const { post } = req;
  const { title, content } = req.body;

  await post.update({ title, content });

  return res.status(200).json({
    status: 'success',
    message: 'the post has been updated',
  });
});

exports.deletePost = catchAsync(async (req, res, next) => {
  const { post } = req;

  await post.update({ status: postStatus.inactive });
  return res.json({
    status: 'success',
    message: 'The product has been deleted!',
  });
});
