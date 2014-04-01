  kernel void clEmboss(global const uchar4* src,
                           global uchar4* dst,
                           uint width, 
                           uint height)
  {
    int x = get_global_id(0);
    int y = get_global_id(1);
    if (x >= width || y >= height) return;

	int x1 = x + 1;
	int y1 = y + 1;
	
	if(x1 >= width) x1 = 0;
	if(y1 >= height) y1 = 0;
	
    int i = y * width + x;
	int j = y1 * width + x1;
	
	float3 color1 = (1.0f/255) * convert_float3(src[i].xyz);
	float3 color2 = (1.0f/255) * convert_float3(src[j].xyz);

	float3 diffs = color1 - color2;
	float max = diffs.x;
	if(fabs(diffs.y) > fabs(max)) max = diffs.y;
	if(fabs(diffs.z) > fabs(max)) max = diffs.z;
	
	float gray = clamp(max + .5, 0., 1.);
	float3 grayVersion = (gray, gray, gray);
	float3 colorVersion = (gray*color1);
	
	float3 inter = mix(grayVersion, colorVersion, 0);

	dst[i] = (uchar4)((uchar)(inter.x * 255.99f), (uchar)(inter.y * 255.99f), (uchar)(inter.z * 255.99f), 255);
	
  }