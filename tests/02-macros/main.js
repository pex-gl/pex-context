var a, b, c, d;

b = V(0,0,0);
a = V(0,0,0);
c = a +v3v3 b +v3v3 V(1,2,3);
c = c ^v3n 2;

console.log(c *v3v3 c);
console.log(c, c ==v3 a, a ==v3 b);