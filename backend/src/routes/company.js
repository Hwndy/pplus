const { index, create, show, destroy, deleteSubsidiary, update } = require('..//controller/CompanyController');
const asyncHandler = require('express-async-handler');
const CreateCompanyRequest = require('..//request/CreateCompanyRequest');
const UpdateCompanyRequest = require('..//request/UpdateCompanyRequest');
const router = require('express').Router();

router.get('', asyncHandler(index));
router.post('', asyncHandler(CreateCompanyRequest), asyncHandler(create));
router.get('/:id', asyncHandler(show));
router.put('/:id', asyncHandler(UpdateCompanyRequest), asyncHandler(update))
router.delete('/:id', asyncHandler(destroy));
router.delete('/:id/subsidiary/:subsidiaryId', asyncHandler(deleteSubsidiary));

module.exports = router;