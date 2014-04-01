  kernel void clEdge(global const uchar4* src,
                           global uchar4* dst,
                           uint width, 
                           uint height)
  {
  
	const float3 LUMCOEFFS = (0.2125, 0.7154, 0.0721);
  
    int x = get_global_id(0);
    int y = get_global_id(1);
    if (x >= width || y >= height) return;

	int x1 = x + 1;
	int y1 = y + 1;
	
	if(x1 >= width) x1 = 0;
	if(y1 >= height) y1 = 0;
	
	int x2 = x - 1;
	int y2 = y - 1;
	
	if(x2 >= width) x2 = 0;
	if(y2 >= height) y2 = 0;
	
    int i1 = y * width + x;
	int i2 = y1 * width + x1;
	int i3 = y1 * width + x;
	int i4 = y * width + x1;
	int i5 = y * width + x2;
	int i6 = y2 * width + x;
	int i7 = y2 * width + x1;
	int i8 = y1 * width + x2;
	int i9 = y2 * width + x2;

	float3 rgb = (1.0f/255) * convert_float3(src[i1].xyz);
	
	float color1 = dot((1.0f/255) * convert_float3(src[i1].xyz), LUMCOEFFS);
	float color2 = dot((1.0f/255) * convert_float3(src[i2].xyz), LUMCOEFFS);
	float color3 = dot((1.0f/255) * convert_float3(src[i3].xyz), LUMCOEFFS);
	float color4 = dot((1.0f/255) * convert_float3(src[i4].xyz), LUMCOEFFS);
	float color5 = dot((1.0f/255) * convert_float3(src[i5].xyz), LUMCOEFFS);
	float color6 = dot((1.0f/255) * convert_float3(src[i6].xyz), LUMCOEFFS);
	float color7 = dot((1.0f/255) * convert_float3(src[i7].xyz), LUMCOEFFS);
	float color8 = dot((1.0f/255) * convert_float3(src[i8].xyz), LUMCOEFFS);
	float color9 = dot((1.0f/255) * convert_float3(src[i9].xyz), LUMCOEFFS);

	
	float h = -1. * color8 - 2. * color3 - 1. * color2 + 1. * color9 + 2. * color6 + 1. * color7;
	float v = -1. * color9 - 2. * color5 - 1. * color8 + 1. * color7 + 2. * color4 + 1. * color2;
	
	float mag  = sqrt(h*h + v*v);
	float3 target = (mag, mag, mag);
	float3 inter = mix(rgb, target, 1);


	dst[i1] = (uchar4)((uchar)(inter.x * 255.99f), (uchar)(inter.y * 255.99f), (uchar)(inter.z * 255.99f), 255);
	
  }