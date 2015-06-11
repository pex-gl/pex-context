macro V {
    rule {($x)      } => {new Array($x)}
    rule {($x,$y)   } => {[$x,$y]}
    rule {($x,$y,$z)} => {[$x,$y,$z]}
}

export V;

//vec3 add
operator (+v3v3) 12 left {$l, $r} => #{[
    $l[0] + $r[0],
    $l[1] + $r[1],
    $l[2] + $r[2]
]}
//vec3 sub
operator (-v3v3) 12 left {$l, $r} => #{[
    $l[0] - $r[0],
    $l[1] - $r[1],
    $l[2] - $r[2]
]}
//vec3 dot
operator (*v3v3) 13 left {$l, $r} => #{[
    $l[0] * $r[0],
    $l[1] * $r[1],
    $l[2] * $r[2]
]}
//vec3 cross
operator (:v3v3) 13 left {$l, $r} => #{[
    $l[1] * $r[2] - $r[1] * $l[2],
    $l[2] * $r[0] - $r[2] * $l[0],
    $l[0] * $r[1] - $r[0] * $l[1]
]}
//vec3 scale
operator (*v3n)  13 left {$l, $r} => #{[
    $l[0] * $r,
    $l[1] * $r,
    $l[2] * $r
]}
//vec3 equals
operator (==v3)  9  left {$l, $r} => #{(
    $l[0] == $r[0] && $l[1] == $r[1] && $l[2] == $r[2]
)}
//vec3 equals not
operator (!=v3)  9  left {$l, $r} => #{(
    $l[0] != $r[0] || $l[1] != $r[1] || $l[2] != $r[2]
)}
//vec3 times
operator (^v3n)  13 left {$l, $r} => #{[
    Math.pow($l[0],$r),
    Math.pow($l[1],$r),
    Math.pow($l[2],$r)
]}

export (+v3v3);
export (-v3v3);
export (*v3v3);
export (:v3v3);
export (*v3n);
export (==v3);
export (!=v3);
export (^v3n);
