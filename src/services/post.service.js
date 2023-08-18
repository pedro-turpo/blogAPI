const { ref, getDownloadUrl } = require('firebase/storage');
const PostImg = require('../models/postImg.model');
const { Post } = require('../models/post.model');
const User = require('../models/user.model');
const AppError = require('../utils/appError');
const storage = require('../utils/firebase');

class PostService {
  async findPost(id) {
    // Buscar un post dado un id, van a excluir UserId, status
    // Adjuntaran el modelo de User, con la info del id, name, profileImgUrl, descripcion
    // adjuntar el modelo de postImg
    try {
      const post = await Post.findOne({
        where: {
          id,
          status: 'active',
        },
        attributes: {
          exclude: ['userId', 'status'],
        },
        include: [
          {
            model: User,
            attributes: ['id', 'name', 'profileImgUrl', 'description'],
          },
          {
            model: PostImg,
          },
        ],
      });

      if (!post) {
        throw new AppError(`Post with id: ${id} not found`, 404);
      }
    } catch (error) {
      throw new Error(error);
    }
  }

  async downloadImgsPost(post) {
    // Resolver todas las urls encocntradas del findPost
    try {
      const imgRefUserProfile = ref(storage, post.user.profileImgUrl);
      const urlProfileUser = await getDownloadUrl(imgRefUserProfile);

      post.user.profileImgUrl = urlProfileUser;

      const postImgsPromises = post.postImgs.map(async (postImg) => {
        const imgRef = ref(storage, postImg.postImgUrl);
        const url = await getDownloadUrl(imgRef);

        postImg.postImgUrl = url;
        return postImg;
      });

      await Promise.all(postImgsPromises);
      return post;
    } catch (error) {
      throw new Error(error);
    }
  }
}

module.exports = PostService;
