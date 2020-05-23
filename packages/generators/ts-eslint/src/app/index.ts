// import Base from 'yeoman-generator';
// const Base = require('yeoman-generator');
// const util = require('util');
// const chalk = require('chalk');
// const Base = require('yeoman-generator');
import Base from 'yeoman-generator';
import util from 'util';
import chalk from 'chalk';
// const util = require('util');
// const chalk = require('chalk');
// import chalk from 'chalk';
// import util from 'util';
// interface SquareConfig {
//     color?: string;
//     width?: number;
// }
//
// function createSquare(config: SquareConfig): { color: string; area: number } {
//     // ...
// }
//
// let mySquare = createSquare({ colour: "red", width: 100 });
const exec = util.promisify(require('child_process').exec); // a;

const sd = new Set(['eslint', 'babel-eslint']);


class EslintGenerator extends Base {
    private extendsArray: [];
    private plugins: [];
    private packages: {};
    constructor(args: any, opts: any) {
        super(args, opts);
        this.extendsArray = [];
        this.plugins = [];
        this.packages = new Set(['eslint', 'babel-eslint']);
        this.argument('configs', {
            type: String,
            required: false,
            default: ''
        });
        this.argument('plugins', {
            type: String,
            required: false,
            default: ''
        });
        this.option('personal', {
            type: Boolean,
            // required: true,
            default: false
        });
    }

    _handlePeerDependenciesPackages(packages:[]) {
        const extraPackages = packages.reduce((acc, next) => {
            Object.keys(next).map((v) => acc.add(v)); // eslint-disable-line
            return acc;
        }, new Set());
        // @ts-ignore
        this.packages = new Set([...this.packages, ...extraPackages]);
    }

    async configuring() {
        const { configs, plugins } = this.options;
        if (configs.length) {
            // @ts-ignore
            // @ts-ignore
            await Promise.all(
                this._createPromises('config', configs, this.extendsArray, true)
            // @ts-ignore
            ).then(this._handlePeerDependenciesPackages.bind(this));
        }

        if (plugins.length) {
            await Promise.all(this._createPromises('plugin', plugins, this.plugins)).then((res) => {
                const extraPackages = res.reduce((acc, next) => {
                    // @ts-ignore
                    if (next.name) {
                    // @ts-ignore
                        acc.add(next.name);
                    }
                    return acc;
                }, new Set());

                // @ts-ignore
                this.packages = new Set([...this.packages, ...extraPackages]);
            });
        }
    }

    _createPromises(type: string, data: string, storage: string[], peer = false) {
        // @ts-ignore
        // @ts-ignore
        return data.split(',').reduce(
            (acc, next) =>
                acc.concat(
                    exec(`npm info eslint-${type}-${next} ${peer ? 'peerDependencies' : ''} --json`)
        // @ts-ignore
                        .then(({ stdout }) => {
                            // if (stdout) {
                            storage.push(next);
                            // }

                            if (type === 'config' && stdout) {
                                // @ts-ignore
                                this.packages.add(`eslint-${type}-${next}`);
                            }
                            return JSON.parse(stdout);
                        })
                        .catch((err: { cmd: any; }) => {
                            this.log(chalk.red(`command ${next} ${err.cmd} failed`));
                            return {};
                        })
                ),
            []
        );
    }

    writing() {
        this.fs.extendJSON(this.destinationPath('package.json'), {
            scripts: {
                lint: 'eslint .'
            }
        });

        const { extendsArray, plugins } = this;
        const { personal } = this.options;

        this.fs.copyTpl(this.templatePath('.*'), this.destinationPath(), {
            extendsArray,
            personal,
            plugins
        });
    }

    install() {
        // @ts-ignore
        this.npmInstall(Array.from(this.packages), { 'save-dev': true });
    }
}

export default EslintGenerator;
