import 'reflect-metadata';
import App from './app';

function build() {
    const server = App();

    server.listen({ port: 3000 }, (err, address) => {
        if (err) {
            console.error(err);
            process.exit(1);
        }
        console.log(`Server listening at ${address}`);
    });
}

build();