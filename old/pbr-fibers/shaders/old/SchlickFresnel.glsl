float base = 1 – dot(V,H);
float exponential = pow( base, 5.0);
float fresnel = exponential + F0 * (1.0 – exponential);
specVal *= fresnel;