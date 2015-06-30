## Testing


I'm using `tape`

```
npm install
node_modules/.bin/tape math/test/Vec2.js
```

Example test

```
test('equals', function(t) {
    var a = [1, 2];
    var b = [1, 2];
    var c = [1, 2.001]

    t.true(Vec2.equals(a, b), 'equal returns true');
    t.false(Vec2.equals(a, c), 'not equal returns false');

    handledMethods.push('equals');
    t.end();
})
```
