const NewsLetter = require('../models/newsletter');
const User = require('../models/users');
const BulkMail = require('../services/email/bulkMail');
const { deleteOne, getOne, getMany } = require('../utils/factoryFunction');
const { badResponse, goodResponseDoc } = require('../utils/response');
const { organizationCheck } = require('../utils/checks');
const Organization = require('../models/organization');

exports.createNewsletterAndSaveAsDraft = async (req, res, next) => {
  try {
    const {
      title,
      content,
      userType,
      status,
      userCategory,
      subCategory,
      organization,
    } = req.body;
    if (!title) return badResponse(res, 'Provide Email title');
    if (!content) return badResponse(res, 'Provide email content');
    if (!userType) return badResponse(res, 'Select user type');

    const user = req.user;

    const organizationCheck = await Organization.findById(organization);
    if (!organizationCheck)
      return badResponse(res, 'Organization does not exist');

    const newsletter = await NewsLetter.create({
      title,
      content,
      userType,
      status,
      subject: title,
      sentBy: user.id,
      organization: organization,
      subCategory,
      category: userCategory,
    });

    goodResponseDoc(
      res,
      'Newsletter created and saved to draft',
      201,
      newsletter
    );
  } catch (error) {
    next(error);
  }
};

exports.sendNewsLetter = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) return badResponse(res, 'Provide newsletter queryId');
    console.log(id)
    const newsletter = await NewsLetter.findById(id).populate({
      path: 'organization',
    });

    const user = req.user;

    if (!newsletter) return badResponse(res, 'Newsletter does not exit');
    const users = await User.find({ organization: newsletter.organization.id });

    await new BulkMail(
      users,
      newsletter.subject,
      newsletter.content,
      newsletter.organization,
      user.firstName,
      res
    ).sendBulk();

    newsletter.status = 'sent';
    await newsletter.save({ validateBeforeSave: false });

    goodResponseDoc(
      res,
      `Newsletter sent to ${newsletter.userType} successfully`,
      200,
      newsletter
    );
  } catch (error) {
    next(error);
  }
};

exports.createNewsletterAndSend = async (req, res, next) => {
  try {
    const {
      title,
      content,
      userType,
      status,
      organization,
      subCategory,
      userCategory,
    } = req.body;
    if (!title) return badResponse(res, 'Provide Email title');
    if (!content) return badResponse(res, 'Provide email content');
    if (!userType) return badResponse(res, 'Select user type');

    const user = req.user;

    const organizationCheck = await Organization.findById(organization);
    if (!organizationCheck)
      return badResponse(res, 'Organization does not exist');

    const newsletter = await NewsLetter.create({
      title,
      content,
      userType,
      status,
      subject: title,
      sentBy: user.id,
      organization: organization,
      subCategory,
      category: userCategory,
    });

    const users = await User.find({ organization: organization });

    const subject = title;

    await new BulkMail(
      users,
      subject,
      content,
      organizationCheck,
      user.firstName,
      res
    ).sendBulk();

    newsletter.status = 'sent';
    await newsletter.save({ validateBeforeSave: false });

    goodResponseDoc(
      res,
      `Newsletter sent to ${newsletter.userType} successfully`,
      201,
      newsletter
    );
  } catch (error) {
    next(error);
  }
};

exports.deleteANewsletter = deleteOne(NewsLetter);
exports.getAllNewsletters = getMany(NewsLetter);
exports.updateNewsletter = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, content, userType, status, subCategory, userCategory } =
      req.body;
    if (!title) return badResponse(res, 'Provide Email title');
    if (!content) return badResponse(res, 'Provide email content');
    if (!userType) return badResponse(res, 'Select user type');

    console.log({subCategory})

    const newsletter = await NewsLetter.findByIdAndUpdate(
      id,
      {
        title,
        content,
        userType,
        status,
        subject: title,
        subCategory: subCategory === "" ? undefined : subCategory,
        category: userCategory === "" ? undefined : userCategory,
      },
      { runValidators: false }
    );

    goodResponseDoc(res, 'Newsletter updated successfully', 200, newsletter);
  } catch (error) {
    next(error);
  }
};

exports.getNewsletterByOrganization = async (req, res, next) => {
  try {
    const { organization } = req.params;
    if (!organization) {
      return badResponse(res, 'Provide OrganizationID');
    }

    const organizationCheck = await Organization.findById(organization);
    if (!organizationCheck)
      return badResponse(res, 'Organization does not exist');

    const newsletters = await NewsLetter.find({ organization })
      .populate({ path: 'sentBy' })
      .populate({ path: 'category' })
      .populate({ path: 'subCategory' });

    goodResponseDoc(
      res,
      'Newsletters Retrieved successfully',
      200,
      newsletters
    );
  } catch (error) {
    next(error);
  }
};
exports.getANewsletter = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) {
      return badResponse(res, 'Provide newsletter Id');
    }

    const newsletter = await NewsLetter.findById(id)
      .populate({ path: 'sentBy' })
      .populate({ path: 'category' })
      .populate({ path: 'subCategory' });

    goodResponseDoc(res, 'Newsletters Retrieved successfully', 200, newsletter);
  } catch (error) {
    next(error);
  }
};
