var test = require('tape');
var Vec2 = require('../Vec2');

var allMethods = Object.keys(Vec2);
var handledMethods = [];

test('create', function(t) {
    var expected = [0, 0];

    var a = Vec2.create();
    t.deepEqual(a, expected);

    handledMethods.push('create');
    t.end();
})

test('set', function(t) {
    var a = [0, 0];
    var b = [1, 1];
    var expected = [1, 1];

    Vec2.set(a, b);
    t.deepEqual(a, expected);

    handledMethods.push('set');
    t.end();
})

test('set2', function(t) {
    var a = [0, 0];
    var expected = [1, 1];

    Vec2.set2(a, 1, 1);
    t.deepEqual(a, expected);

    handledMethods.push('set2');
    t.end();
})

test('copy', function(t) {
    var a = [1, 2];
    var expectedCopyOfA = [1, 2];

    var c = Vec2.copy(a);
    t.deepEqual(c, expectedCopyOfA, 'should copy');

    a[0] = 9;
    t.deepEqual(c, expectedCopyOfA, 'should not modify the original');

    var b = [1, 2];
    var expectedCopyOfB = [1, 2];
    var d = Vec2.create();
    var copyResult = Vec2.copy(b, d);
    t.deepEqual(d, expectedCopyOfB, 'should support out');
    t.equal(d, copyResult, 'should return out');
    b[0] = 9;
    t.deepEqual(c, expectedCopyOfB, 'out should not modify the original');

    handledMethods.push('copy');
    t.end();
})

test('equals', function(t) {
    var a = [1, 2];
    var b = [1, 2];
    var c = [1, 2.001]

    t.true(Vec2.equals(a, b), 'equal returns true');
    t.false(Vec2.equals(a, c), 'not equal returns false');

    handledMethods.push('equals');
    t.end();
})

test('equals2', function(t) {
    var a = [1, 2];

    t.true(Vec2.equals2(a, 1, 2), 'equal returns true');
    t.false(Vec2.equals2(a, 1, 2.001), 'not equal returns false');

    handledMethods.push('equals2');
    t.end();
})

test('coverage', function(t) {
    t.equal(allMethods.length, handledMethods.length);
    allMethods.forEach(function(name) {
        if (handledMethods.indexOf(name) == -1) {
            console.log('missing test for ' + name);
        }
    })
    t.end();
})
