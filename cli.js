#!/usr/bin/env node


const exec = require('child_process').exec,
	getopt = require('node-getopt');


const exec_command = function(cmd) {
	return new Promise((resolve, reject) => {
		console.log(cmd);

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
	return exec_command('git reset HEAD');
};


const postversion = function() {
	const opt = getopt.create([['-v', 'version=ARG']])
		.parseSystem();

	console.log(opt);

	return exec_command('git push');
};


const action = function(func, ...args) {
	func.apply(undefined, args)
		.then(
			() => process.exit(0),
			(error) => {
				console.error(error);
				process.exit(3);
			}
		);
};


if (process.argv.length < 3) {
	console.error('Usage: cli.js <action> [options...]');
	process.exit(1);
}


switch (process.argv[2]) {
	case 'preversion':
		action(preversion);
		break;

	case 'postversion':
		action(postversion);
		break;

	default:
		console.error(`Invalid command: ${process.argv[1]}`);
		process.exit(2);
}
