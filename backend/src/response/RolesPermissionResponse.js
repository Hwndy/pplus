function RolesPermissionResource(data)
{
    return {
        id: data.permission.id,
        name: data.permission.name
    }
}

function RolesPermissionArray(datas)
{
    return datas.map(d => RolesPermissionResource(d));
}

module.exports = {
    RolesPermissionArray
}