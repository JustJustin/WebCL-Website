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
	
	
	kernel void Particle (global point *dPobj, global vector *dVobj, global color *dCobj) {
	
	
		int gid = get_global_id( 0 );
	
		point  p = dPobj[gid];
		vector v = dVobj[gid];
		color  c = dCobj[gid];
		
		point pp = p + DT * v + .5f * DT * DT * G;
		vector vp = v + DT * G;
		
		pp.w = 1.;
		vp.w = 0.;
		
		
		if( IsInsideSphere( pp, Sphere1 ) )
		{
			vp = BounceSphere( p, v, Sphere1 );
			pp = p + DT * vp + .5f*DT*DT*G;
		}
		
		dPobj[gid] = pp;
		dVobj[gid] = vp;
		dCobj[gid] = c;
	}
	
	
	
	