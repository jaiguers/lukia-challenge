import { startCLI } from './cli';

// Main entry point
if (require.main === module) {
  startCLI().catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}

