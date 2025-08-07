const Notification = require('../models/notification');
const { badResponse, goodResponseDoc } = require('../utils/response');
const User = require('../models/users');
const Admin = require('../models/admins');
const UserNotification = require('../models/userNotification');
const { getIO } = require('../services/socket/io');
const { deleteOne, getMany } = require('../utils/factoryFunction');
const Organization = require('../models/organization');

exports.createNotificationAndSend = async (req, res, next) => {
  try {
    console.log('test');
    const user = req.user;
    const io = getIO();
    const {
      title,
      subject,
      content,
      description,
      userType,
      status,
      userCategory,
      subCategory,
      organization,
    } = req.body;
    if (!title) return badResponse(res, 'Provide title');
    if (!subject) return badResponse(res, 'Provide subject');
    if (!content) return badResponse(res, 'Provide content');
    if (!description) return badResponse(res, 'Provide description');
    if (!userType) return badResponse(res, 'Provide user type');
    // if (!userCategory) return badResponse(res, 'Provide user category');
    // if (!subCategory) return badResponse(res, 'Provide sub category');
    if (!organization) return badResponse(res, 'Provide organization');
    console.log(user);

    const notification = await Notification.create({
      title,
      subject,
      content,
      description,
      userType,
      userCategory,
      subCategory,
      organization,
      status: 'sent',
      sentBy: user.id,
    });

    let users;

    if (userType === 'users') {
      users = await User.find({
        subCategory,
      });
    } else {
      users = await Admin.find({});
    }
    const userNotifications = users.map((user) => ({
      user: user._id,
      notification: notification._id,
      organization: organization,
    }));

    await UserNotification.insertMany(userNotifications);

    io.emit(`${subCategory}-notification-created`, {
      title: notification.title,
      subject: notification.subject,
      content: notification.content,
      description: notification.description,
      userType: notification.userType,
    });

    goodResponseDoc(
      res,
      `Notification created and sent to ${userType} successfully`,
      201,
      notification
    );
  } catch (error) {
    next(error);
  }
};

exports.createNotificationAndSaveAsDraft = async (req, res, next) => {
  try {
    const {
      title,
      subject,
      content,
      description,
      userType,
      userCategory,
      subCategory,
      organization,
    } = req.body;

    if (!title) return badResponse(res, 'Provide title');
    if (!subject) return badResponse(res, 'Provide subject');
    if (!content) return badResponse(res, 'Provide content');
    if (!description) return badResponse(res, 'Provide description');
    if (!userType) return badResponse(res, 'Provide user type');

    if (!userCategory) return badResponse(res, 'Provide user category');
    if (!subCategory) return badResponse(res, 'Provide sub category');
    if (!organization) return badResponse(res, 'Provide organization');

    const user = req.user;

    const notification = await Notification.create({
      title,
      subject,
      content,
      description,
      userType,
      status: 'draft',
      userCategory,
      subCategory,
      organization,
      sentBy: user._id,
    });

    goodResponseDoc(
      res,
      'Notification created successfully',
      201,
      notification
    );
  } catch (error) {
    next(error);
  }
};

exports.sendNotification = async (req, res, next) => {
  try {
    const io = getIO();
    const { id } = req.params;
    if (!id) return badResponse(res, 'Provide notification id');

    const notification = await Notification.findById(id);

    if (!notification) return badResponse(res, 'Notification does not exist');

    if (notification.status === 'draft') {
      notification.status = 'sent';
    }

    await notification.save({ validateBeforeSave: false });

    let users;

    if (notification.userType === 'users') {
      users = await User.find({
        subCategory: notification.subCategory,
      });
    } else {
      users = await Admin.find({});
    }

    const userNotifications = users.map((user) => ({
      user: user._id,
      notification: notification._id,
      organization: notification.organization,
    }));

    await UserNotification.insertMany(userNotifications);

    io.emit(`${notification.subCategory}-notification-sent`, {
      title: notification.title,
      subject: notification.subject,
      content: notification.content,
      description: notification.description,
      userType: notification.userType,
      status: notification.status,
    });

    goodResponseDoc(res, 'Notification sent successfully', 200, notification);
  } catch (error) {
    next(error);
  }
};

exports.deleteNotification = deleteOne(Notification);
exports.getAllNotifications = getMany(Notification);

exports.updateNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      title,
      subject,
      content,
      description,
      userType,
      status,
      userCategory,
      subCategory,
      organization,
    } = req.body;
    if (!id) return badResponse(res, 'Provide notification id');
    if (!title) return badResponse(res, 'Provide title');
    if (!subject) return badResponse(res, 'Provide subject');
    if (!content) return badResponse(res, 'Provide content');
    if (!description) return badResponse(res, 'Provide description');
    if (!userType) return badResponse(res, 'Provide user type');

    const notification = await Notification.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    goodResponseDoc(
      res,
      'Notification updated successfully',
      200,
      notification
    );
  } catch (error) {
    next(error);
  }
};

exports.getNotificationByOrganization = async (req, res, next) => {
  try {
    const { organization } = req.params;
    if (!organization) return badResponse(res, 'Provide organization id');

    const organizationCheck = await Organization.findById(organization);
    if (!organizationCheck)
      return badResponse(res, 'Organization does not exist');

    // Fetch notifications and populate all relevant fields in one go
    const notifications = await Notification.find({ organization })
      .populate('sentBy')
      .populate('organization')
      .populate('userCategory');
    // .populate('subCategory');

    goodResponseDoc(
      res,
      'Notifications retrieved successfully',
      200,
      notifications
    );
  } catch (error) {
    next(error);
  }
};

exports.getANotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) return badResponse(res, 'Provide notification id');

    const notification = await Notification.findById(id)
      .populate({
        path: 'sentBy',
      })
      // .populate({
      //   path: 'userCategory',
      // })
      // .populate({
      //   path: 'subCategory',
      // })
      .populate({
        path: 'organization',
      });

    if (!notification) return badResponse(res, 'Notification does not exist');

    goodResponseDoc(
      res,
      'Notification retrieved successfully',
      200,
      notification
    );
  } catch (error) {
    next(error);
  }
};
