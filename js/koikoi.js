function KoiKoi() {
    var self = this;

    self.months = {
        1: 'January',
        2: 'February',
        3: 'March',
        4: 'April',
        5: 'May',
        6: 'June',
        7: 'July',
        8: 'August',
        9: 'September',
        10: 'October',
        11: 'November',
        12: 'December'
    };
    self.scoringMethod = ko.observable('moonrabbit-seasonal');

    self.gameSettings = {
        'moonrabbit': {
            name: 'Moon Rabbit Hanafuda',
            points: {
                'goko': 10,
                'shiko': 8,
                'ameshiko': 7,
                'sanko': 5,
                'aotan': 5,
                'akatan': 5,
                'tanzaku': 1,
                'inoshikacho': 5,
                'tane': 1,
                'kosu': 1,
                'hanami': 5,
                'tsukimi': 5,
                'teshi': 6,
                'kuttsuki': 6,
                'dealer': 4,
                'month': 4
            },
            seasonalViewing: false,
            rainyDayPenalty: false,
            koiModifier: function(points) { return points*2; }
        },
        'nintendo': {
            name: 'Nintendo',
            points: {
                'goko': 15,
                'shiko': 8,
                'ameshiko': 7,
                'sanko': 6,
                'aotan': 5,
                'akatan': 5,
                'tanzaku': 1,
                'inoshikacho': 5,
                'tane': 1,
                'kosu': 1,
                'hanami': 5,
                'tsukimi': 5,
                'teshi': 6,
                'kuttsuki': 6,
                'dealer': 4,
                'month': 4,
            },
            seasonalViewing: false,
            rainyDayPenalty: false,
            koiModifier: function(points) { return points*2; }
        }
    };
    self.gameSettings['moonrabbit-variant'] = JSON.parse(JSON.stringify(self.gameSettings.moonrabbit));
    self.gameSettings['moonrabbit-variant'].rainyDayPenalty = true;
    self.gameSettings['moonrabbit-variant'].name = 'Moon Rabbit Hanafuda (Rainy Day Penalty)';
    self.gameSettings['moonrabbit-variant'].koiModifier = function(points) { return points*2; };
    self.gameSettings['moonrabbit-seasonal'] = JSON.parse(JSON.stringify(self.gameSettings.moonrabbit));
    self.gameSettings['moonrabbit-seasonal'].seasonalViewing = true;
    self.gameSettings['moonrabbit-seasonal'].name = 'Moon Rabbit Hanafuda (Seasonal Viewing Only)';
    self.gameSettings['moonrabbit-seasonal'].koiModifier = function(points) { return points*2; };
    self.scoringMethods = ko.pureComputed(function() {
        return Object.keys(self.gameSettings);
    });
    self.scoringMethodsText = function (key) {
        return self.gameSettings[key].name;
    };

    if (typeof localStorage['scoringMethod'] !== 'undefined' && typeof self.gameSettings[localStorage['scoringMethod']] !== 'undefined') {
        self.scoringMethod(localStorage['scoringMethod']);
    }
    self.scoringMethod.subscribe(function (newMethod) {
        localStorage['scoringMethod'] = newMethod;
    });

    self.currentMonth = ko.observable(1);
    self.playerPoints = {
        '1': ko.observable(typeof localStorage['playerOnePoints'] !== 'undefined' ? parseInt(localStorage['playerOnePoints'], 10) : 0),
        '2': ko.observable(typeof localStorage['playerTwoPoints'] !== 'undefined' ? parseInt(localStorage['playerTwoPoints'], 10) : 0)
    };
    self.playerPoints['1'].subscribe(function (newPoints) {
        localStorage['playerOnePoints'] = newPoints;
    });
    self.playerPoints['2'].subscribe(function (newPoints) {
        localStorage['playerTwoPoints'] = newPoints;
    });
    self.playerNames = {
        '1': ko.observable(typeof localStorage['playerOneName'] !== 'undefined' ? localStorage['playerOneName'] : 'Red'),
        '2': ko.observable(typeof localStorage['playerTwoName'] !== 'undefined' ? localStorage['playerTwoName'] : 'Blue')
    };
    self.playerNames['1'].subscribe(function(newName) {
        localStorage['playerOneName'] = newName;
    });
    self.playerNames['2'].subscribe(function(newName) {
        localStorage['playerTwoName'] = newName;
    });
    self.awardingPointsTo = ko.observable(1);
    self.calledKoi = ko.observable(false);
    self.brights = ko.observable(0);
    self.inoShikaCho = ko.observable(false);
    self.animals = ko.observable(false);
    self.additionalAnimals = ko.observable(0);
    self.poetryRibbons = ko.observable(false);
    self.blueRibbons = ko.observable(false);
    self.ribbons = ko.observable(false);
    self.additionalRibbons = ko.observable(0);
    self.dregs = ko.observable(false);
    self.additionalDregs = ko.observable(0);

    self.hasRainman = ko.observable(false);
    self.hasThunderstorm = ko.observable(false);

    self.hasMonth = ko.observable(false);
    self.hanami = ko.observable(false);
    self.tsukimi = ko.observable(false);
    self.wonFromHand = ko.observable(false);
    self.tableHasMonth = ko.observable(false);
    self.nobodyWon = ko.observable(false);

    self.resetGame = function () {
        self.currentMonth(1);
        self.playerPoints['1'](0);
        self.playerPoints['2'](0);
        self.awardingPointsTo(1);
        self.resetRound();
    };
    self.resetRound = function () {
        self.calledKoi(false);
        self.brights(0);
        self.inoShikaCho(false);
        self.animals(false);
        self.additionalAnimals(0);
        self.poetryRibbons(false);
        self.blueRibbons(false);
        self.ribbons(false);
        self.additionalRibbons(0);
        self.dregs(false);
        self.additionalDregs(0);
        self.hasRainman(false);
        self.hasThunderstorm(false);

        self.hasMonth(false);
        self.hanami(false);
        self.tsukimi(false);
        self.wonFromHand(false);
        self.tableHasMonth(false);
        self.nobodyWon(false);
    };
    self.awardPoints = function () {
        self.playerPoints[self.awardingPointsTo()](self.playerPoints[self.awardingPointsTo()]() + self.points());
        self.resetRound();
        self.currentMonth(parseInt(self.currentMonth(), 10) + 1);
    };

    self.resetGame();
    self.points = ko.pureComputed(function () {
        var settings = self.gameSettings[self.scoringMethod()];
        var pointMap = settings.points;

        if (self.wonFromHand()) {
            return pointMap.teshi;
        }

        if (self.nobodyWon()) {
            return pointMap.dealer;
        }

        var points = 0;
        switch (self.brights()) {
            case '5':
                points += pointMap.goko;
                break;
            case '4':
                points += pointMap.shiko;
                break;
            case '4r':
                points += pointMap.ameshiko;
                break;
            case '3':
                points += pointMap.sanko;
                break;
        }

        if (self.inoShikaCho()) {
            points += pointMap.inoshikacho + parseInt(self.additionalAnimals(), 10);
        }

        if (!self.inoShikaCho() && self.animals()) {
            points += pointMap.tane + parseInt(self.additionalAnimals(), 10);
        }

        if (self.poetryRibbons()) {
            points += pointMap.akatan;
        }
        if (self.blueRibbons()) {
            points += pointMap.aotan;
        }
        if (self.ribbons() && !self.poetryRibbons() && !self.blueRibbons()) {
            points += pointMap.tanzaku;
        }
        if (self.ribbons() || self.poetryRibbons() || self.blueRibbons()) {
            points += parseInt(self.additionalRibbons(), 10);
        }

        var hasHanami = self.hanami();
        var hasTsukimi = self.tsukimi();
        var ruinedViewing = settings.rainyDayPenalty && (self.hasRainman() || self.hasThunderstorm());
        var isMarch = self.currentMonth() === '3';
        var isAugust = self.currentMonth() === '8';
        var seasonalViewing = settings.seasonalViewing;

        if (hasHanami && !ruinedViewing && (!seasonalViewing || isMarch)) {
            points += pointMap.hanami;
        }
        if (hasTsukimi && !ruinedViewing && (!seasonalViewing || isAugust)) {
            points += pointMap.tsukimi;
        }

        if (self.dregs()) {
            points += pointMap.kosu + parseInt(self.additionalDregs(), 10);
        }

        if (self.hasMonth()) {
            points += pointMap.month;
        }

        if (self.calledKoi()) {
            points = settings.koiModifier(points);
        }

        return points;
    });
}

