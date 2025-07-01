const express = require('express');
const router = express.Router();
const Controller = require('../controllers/userControllers');
const auth = require('../middlewares/auth');
const todoController = require('../controllers/todoControllers');
const {signupSchema,loginSchema,todoSchema} = require('../validators/authValidator');
const validate = require('../middlewares/validate');
const upload = require('../middlewares/multer');



//======== user_Routes ==========//
router.post('/signUp',validate(signupSchema),upload.single('profileImage'),Controller.signUp);
router.post('/login',validate(loginSchema),Controller.login);
router.get('/getUserList',Controller.usersList);
router.get('/getUser/:id',auth,Controller.singleUser);
router.get('/:userName',auth,Controller.singleName);
router.put('/updateUser/:id',auth,Controller.userUpdate);
router.delete('/userDelete/:id',auth,Controller.userDelete);

//========== todo_User_Routes ======
router.post('/signupTodo',validate(todoSchema),auth,upload.array('images',3),todoController.signupTodo);
router.get('/',todoController.UserTodo);
router.get('/singleUserTodo/:id',auth,todoController.singleUserTodo);
router.put('/updateTodo/:id',auth,todoController.updateTodo);
router.delete('/todoDelete/:id',auth,todoController.deleteTodo);
router.get('/getItems/task',auth,todoController.getItems);
module.exports = router;
