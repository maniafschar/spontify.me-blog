const path = require('path');

module.exports = {
	entry: {
		// main: './src/blog/js/main.js',
		stats: './src/stats/js/main.js'
	},
	mode: 'production',
	output: {
		globalObject: 'this',
		filename: 'js/[name].js',
		path: path.resolve(__dirname, 'dist'),
	},
	optimization: {
		minimize: false
	},
	target: ['web', 'es5'],
	devServer: {
		static: {
			directory: path.join(__dirname, 'dist')
		},
		compress: false,
		port: 9000
	},
	module: {
		rules: [
			{
				test: /\.m?js$/,
				exclude: /(node_modules|bower_components)/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: ['@babel/preset-env'],
						plugins: ['@babel/plugin-transform-runtime']
					}
				}
			}
		]
	},
	experiments: {
		topLevelAwait: true
	}
}