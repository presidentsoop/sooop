require('dotenv').config({ path: '.env.local' });
const { activateExistingMembership } = require('./src/app/actions/auth');

async function testActivation() {
    const result = await activateExistingMembership('hthpb.soooptest@inbox.testmail.app');
    console.log("Result:", result);
}

testActivation();
