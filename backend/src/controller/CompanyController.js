const CreateCompany = require("../action/Company/CreateCompany");
const DeleteCompany = require("../action/Company/DeleteCompany");
const DeleteCompanySubsidiary = require("../action/Company/DeleteCompanySubsidiary");
const FetchAllCompany = require("../action/Company/FetchAllCompany");
const FetchSingleCompany = require("../action/Company/FetchSingleCompany");
const UpdateCompany = require("../action/Company/UpdateCompany");
const { success, error } = require("../helper/ApiResponse");
const { CompanyCollection, CompanyResource } = require("../response/CompanyResponse");

async function index(req, res)
{
    if(company = await FetchAllCompany(req.query.page))
    {
        return success(res, CompanyCollection(company), "All Company");
    }
    return success(res, {}, 'No company found');
}

async function create(req, res)
{
    if(await CreateCompany(req.CompanyData, req.SubsidiaryData))
    {
        return success(res, {}, "Company Created");
    }

    return error(res, "Cannot create Company");
}

async function show(req, res)
{
    if(company = await FetchSingleCompany(req.params.id))
    {
        return success(res, CompanyResource(company), 'Single Company');
    }

    return error(res, 'Company not found');
}

async function destroy(req, res)
{
    if(await DeleteCompany(req.params.id))
    {
        return success(res, {}, 'Company Deleted');
    }

    return error(res, 'Company Not Found');
}

async function update(req, res)
{
    if(await UpdateCompany(req.params.id, req.CompanyData, req.SubsidiaryData))
    {
        return success(res, {}, 'Company Updated');
    }

    return error(res, 'Company not found');
}

async function deleteSubsidiary(req, res)
{
    if(await DeleteCompanySubsidiary(req.params.id, req.params.subsidiaryId))
    {
        return success(res, {}, 'Subsidiary deleted');
    }

    return error(res, 'Subsidiary not found');
}

module.exports = {
    index,
    create,
    show,
    update,
    destroy,
    deleteSubsidiary
}