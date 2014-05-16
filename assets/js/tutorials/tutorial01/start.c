kernel void ckVectorAdd(global uint* A, 
			global uint* B,
			global uint* C,
			uint dataLength)
{
	uint x = get_global_id(0);
	if (x >= dataLength) {
		return;
	}
	// add the vector elements
	C[x] = A[x] + B[x];
}