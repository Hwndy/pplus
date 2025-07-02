const app = require('./app');
const db = require('./models/index');


const port = process.env.APP_PORT;

app.listen(port, () => {
    // db.sequelize.sync();
    console.log(`Server started on ${port}`)
})