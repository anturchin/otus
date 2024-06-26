import 'dotenv/config';
import http from 'node:http';

import DataBase from './db/DataBase';
import App from './app/App';

class Main {
    private readonly dbUri: string =
        process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/best-courses';

    private readonly port: number = parseInt(process.env.PORT || '', 10) || 8000;

    private readonly server: http.Server;

    constructor() {
        this.server = http.createServer(new App().getApp());
    }

    public async run(): Promise<void> {
        await DataBase.connect(this.dbUri);

        this.onError(this.server);
        this.server.listen(this.port, () => {
            console.log(`Server started, listening on port ${this.port}`);
        });

        this.handleExit();
    }

    private onError(server: http.Server): void {
        server.on('error', async (error: NodeJS.ErrnoException) => {
            if (error.code === 'EACCES') {
                console.log(`no access to port: ${this.port}`);
                await DataBase.disconnect();
                process.exit(1);
            } else {
                throw error;
            }
        });
    }

    private handleExit(): void {
        process.on('SIGINT', async () => {
            console.log('Shutting down gracefully...');
            await DataBase.disconnect();
            process.exit(0);
        });

        process.on('SIGTERM', async () => {
            console.log('Shutting down gracefully...');
            await DataBase.disconnect();
            process.exit(0);
        });
    }
}

new Main().run();
