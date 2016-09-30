#!/usr/bin/env node


const exec = require('child_process').exec,
	getopt = require('node-getopt'),
	opn = require('opn'),
	path = require('path');


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


const package_json = function() {
	return require(path.join(process.cwd(), 'package.json'));
};


const repository_url = function() {
	const pkg_json = package_json();

	if (!pkg_json.hasOwnProperty('repository')) {
		throw new Error('Missing \'repository\' field in package.json');
	}

	if (pkg_json.repository.isPrototypeOf(String)) {
		return pkg_json.repository;
	}

	if (!pkg_json.repository.hasOwnProperty('url')) {
		throw new Error('Missing \'repository.url\' field in package.json');
	}

	return pkg_json.repository.url;
};


const preversion = function() {
	return exec_command('git reset HEAD');
};


const postversion = function() {
	const opt = getopt.create([['v', 'version=ARG']])
		.parseSystem();

	return exec_command('git push --tags')
		.then(() => {
			const changelog_url = repository_url()
				.replace(/^(git\+https?|git\+ssh):\/\/(.*@)?(.+?)(\.git\/?)?$/, 'https://$3')
				.concat('/releases/tag/v' + opt.options.version);

			// asynchronous on purpose
			opn(changelog_url);
		});
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
