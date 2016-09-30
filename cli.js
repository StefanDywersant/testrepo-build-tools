#!/usr/bin/env node

const childProcess = require('child_process'),
	getopt = require('node-getopt'),
	opn = require('opn'),
	path = require('path');

/**
 * Executes given command. Prints results to stdout/stderr.
 * @param {string} cmd Command to be executed
 * @returns {Promise}
 */
const exec = function(cmd) {
	return new Promise((resolve, reject) => {
		childProcess.exec(cmd, {}, (error, stdout, stderr) => {
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

/**
 * Reads contents of package.json file.
 * @returns {object}
 */
const packageJson = function() {
	return require(path.join(process.cwd(), 'package.json'));
};

/**
 * Extracts repository URL from package.json.
 * @returns {string}
 */
const repositoryURL = function() {
	const pkgJson = packageJson();

	if (!pkgJson.hasOwnProperty('repository')) {
		throw new Error('Missing \'repository\' field in package.json');
	}

	if (pkgJson.repository.isPrototypeOf(String)) {
		return pkgJson.repository;
	}

	if (!pkgJson.repository.hasOwnProperty('url')) {
		throw new Error('Missing \'repository.url\' field in package.json');
	}

	return pkgJson.repository.url;
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

// *** ACTIONS ***

/**
 * NPM's preversion hook
 * @returns {Promise}
 */
const preversion = function() {
	return exec('git reset HEAD');
};

/**
 * NPM's postversion hook
 * @returns {Promise}
 */
const postversion = function(version) {
	return exec('git push --tags')
		.then(() => {
			const changelogURL = repositoryURL()
				.replace(/^(git\+https?|git\+ssh):\/\/(.*@)?(.+?)(\.git\/?)?$/, 'https://$3')
				.concat(`/releases/tag/v${version}`);

			// asynchronous on purpose
			opn(changelogURL);
		});
};

// *** MAIN ***

// check arguments
if (process.argv.length < 3) {
	console.error('Usage: cli.js <action> [options...]');
	process.exit(1);
}

// dispatch action
switch (process.argv[2]) {
	case 'preversion':
		action(preversion);
		break;

	case 'postversion':
		const opt = getopt.create([['v', 'version=ARG']])
			.parseSystem();

		action(postversion, opt.options.version);
		break;

	default:
		console.error(`Invalid command: ${process.argv[1]}`);
		process.exit(2);
}
