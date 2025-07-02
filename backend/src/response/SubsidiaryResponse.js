function SubsidiaryResource(subsidiary)
{
    return {
        id: subsidiary.id,
        prefix: subsidiary.prefix,
        subsidiary: subsidiary.company.name
    }
}

function SubsidiaryArray(subsidiaries)
{
    return subsidiaries.map(s => SubsidiaryResource(s));
}

module.exports = SubsidiaryArray;