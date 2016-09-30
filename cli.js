#!/usr/bin/env node


const exec = require('child_process').exec;


const exec_command = function(cmd) {
	return new Promise((resolve, reject) => {
		exec(cmd, {}, (error, stdout, stderr) => {
			if (error) {
				reject(error);
				return;
			}

			process.stdout.write(stdout);
			process.stderr.write(stderr);

			resolve();
		});
	});
};


const preversion = function() {
	exec_command('git reset HEAD')
		.then(
			() => process.exit(0),
			(error) => {
				console.error(error);
				process.exit(3);
			}
		);
};


const postversion = function() {
	//exec_command('')
};


if (process.argv.length < 3) {
	console.error('Usage: cli.js <action>');
	process.exit(1);
}


switch(process.argv[2]) {
	case 'preversion':
		preversion();
		break;

	case 'postversion':
		postversion();
		break;

	default:
		console.error(`Invalid command: ${process.argv[1]}`);
		process.exit(2);
}
