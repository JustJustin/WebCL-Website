	typedef float4 point;
	typedef float4 vector;
	typedef float4 color;
	typedef float4 sphere;
	
	
	constant float4 G       = (float4) ( 0., -9.8, 0., 0. );
	constant float  DT      = 0.1;
	constant sphere Sphere1 = (sphere)( -100., -800., 0.,  600. );
	
	vector
	Bounce( vector in, vector n )
	{
		n.w = 0.;
		n = normalize( n );
		vector out = in - 2.0f * dot(in.xyz, n.xyz) * n;
		out.w = 0.;
		return out;
	}

	vector
	BounceSphere( point p, vector v, sphere s )
	{
		return Bounce(v, (float4)( p.x, p.y, p.z, 0 ) - (float4)( s.x, s.y, s.z, 0 ));
	}

	bool
	IsInsideSphere( point p, sphere s )
	{
		if(s.w >= fast_distance( (float3)( p.x, p.y, p.z ), (float3)( s.x, s.y, s.z )))
			return true;
		else
			return false;
	}
	
	vector
	GravitySphere (point p, float m1, sphere s, float m2)
	{
		float r = fast_distance( (float3)( p.x, p.y, p.z ), (float3)( s.x, s.y, s.z ));
		vector d = p - s;
		float co = 6.67E-11 * r * m1 * m2;
		d = -co *  d;
		d.w = 1;
		return d;
	}
	
	
	kernel void Particle (global point *dPobj, global vector *dVobj, global color *dCobj) {
	
	
		int gid = get_global_id( 0 );
	
		point  p = dPobj[gid];
		vector v = dVobj[gid];
		color  c = dCobj[gid];
		

		
		//vector force = GravitySphere(p, .000005, Sphere1, 5000.0);
		
		vector a = G;
		//vector a = (1/.000005f) * force;
		
		point pp = p + DT * v + .5f * DT * DT * a;
		vector vp = v + DT * a;
		
		pp.w = 1.;
		vp.w = 0.;
		
		
		if( IsInsideSphere( pp, Sphere1 ) )
		{
			vp = BounceSphere( p, v, Sphere1 );
			pp = p + DT * vp + .5f*DT*DT*a;
		}
		
		dPobj[gid] = pp;
		dVobj[gid] = vp;
		dCobj[gid] = c;
	}
	
	
	
	