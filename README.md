# Wunderground CLI

[![npm](https://img.shields.io/npm/v/npm.svg)](https://www.npmjs.com) [![npm](https://img.shields.io/npm/l/express.svg)](wunderground-cli/LICENSE) [![Travis](https://img.shields.io/travis/mirkoschubert/wunderground-cli.svg)](https://travis-ci.org/mirkoschubert/wunderground-cli)

**Wunderground CLI** is a command line tool for accessing weather data from [wunderground.com](https://www.wunderground.com). It can store multiple cities and show the current weather und forecast of eiter one or all cities.

## Installation

Since the application is written for node.js installing is pretty easy. Fork or download the code and switch to the working folder, then just type the following command in your shell:

```
npm install -g
```
After installing the app, please register at wunderground.com and set up an API key [here](https://www.wunderground.com/weather/api). You can get 500 API calls per day and 10 API calls per minute for free. Copy the API key and save it with the following command:

```
weather init [apikey]
```
That's it! You're ready to get some weather data.

## Usage

### Adding cities

Adding one or more cities is pretty easy. If you want to add `Tokyo`to your list, please enter this command:

```
weather add Tokyo
```
The application will search for the city and ask you to choose the right city if there is more than one. If the name of the city consists of more than one word, please enter it in quotation marks:

```
weather add "New York"
```
If you want to see which cities you've already stored, use this command:

```
weather list
```

### Retrieving the weather

When you're set up, you can retrieve the weather of all saved cities at any time:

```
weather now
```

Please note, that multiple cities need multiple API calls. If you want to see the weather of only one city, get the ID from `weather list` and input:

```
weather now 1
```

### Getting the forecast

If you want to look up the forecast for the next days, you can simply call:

```
weather forecast
```

This will show all saved cities with a 3 day forecast. If you put the ID from `weather list` behind, you can select the city. In this case the full 10 day forecast will be shown. If you want to get more or less days, you can always use the option `--days`.

```
weather forecast 1 --days 5
```

### Getting Alerts

Alerts are still work in progress. To try it out, use the following command:

```
weather alert 1
```

## Roadmap

- [x] Store the API key in a config file
- [x] Confirm cities with a free API call and store them in a config file
- [x] Remove cities from the config file
- [x] List all added cities in a list
- [x] Read weather data from one or all added cities
- [x] Get forecast of one or all added cities
- [x] Get imperial or metric units and temperature in Fahrenheit or Celsius
- [ ] Format date and time better
- [ ] Switch units and temperature scales quickly with (global?) options
- [ ] Ask if it's raining soon
- [ ] Ask if any weather warnings are in your area.

## License & Contribution

This software is licensed under the MIT License.

Since I'm new to node.js and asynchronous JavaScript programming and this is actually my first attempt I will be glad for any hints and best practices. Feel free to contact me or contribute with a fork of this project!
