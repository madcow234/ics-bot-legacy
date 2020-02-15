import { initApplication } from './conf/bootstrap';

/**
 * We use this pattern of calling a single method from the main entry point so we can use async/await in {@link initApplication}.
 */
initApplication().catch(err => console.log(`Uncaught Exception: ${err}`));