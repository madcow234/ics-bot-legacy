import { initApplication } from './conf/bootstrap';

// We use this pattern of calling a single method from the main
// entry point because this file cannot use the logging framework
initApplication().catch(err => console.log(err));