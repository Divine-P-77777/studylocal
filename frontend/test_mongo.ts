import dbConnect from './src/lib/db/connect';
import Message from './src/lib/models/Message';
import TutorProfile from './src/lib/models/TutorProfile';
import User from './src/lib/models/User';

async function testMongo() {
    await dbConnect();
    console.log("Connected");
    const tutors = await TutorProfile.countDocuments({});
    const msgs = await Message.countDocuments({});
    const users = await User.countDocuments({});
    console.log(`Mongoose Counts -> Tutors: ${tutors}, Messages: ${msgs}, Users: ${users}`);
    
    const tutor = await TutorProfile.findOne({ auth0Id: 'google-oauth2|115309879984282774935' });
    console.log("Tutor Profile found?", tutor ? tutor._id.toString() : 'None');

    const roomMsgs = await Message.distinct('roomId', {});
    console.log("Distinct rooms in Message:", roomMsgs);

    const testTutor = await TutorProfile.findOne({ auth0Id: 'google-oauth2|115309879984282774935' }).lean();
    console.log("Lean ID:", testTutor?._id?.toString());
}
testMongo().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
