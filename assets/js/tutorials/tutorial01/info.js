var tutorial_data =
{
	name:"Vector Operations",
	steps:
	[
		{
			text:"Welcome to our OpenCL tutorial! Things are a " +
				"little rough right now but we hope that you " +
				"will stick with us. When you are ready to " +
				"begin go ahead and press next step below.",
			editor:1,
			editorText: '/js/tutorials/tutorial01/start.c',
			otherText: {
				'0':'/js/tutorials/tutorial01/start.js',
				'2' : '/js/tutorials/tutorial01/start.html'
			},
			complete: function(code, user, output) {
				var reg = /print\(['"]hello['"]\);/gi;
				if (reg.exec(code)) {
					return true;
				}
			},
			lock: false,
			forceFocus: false,
			allowSkip: true
		},
		{
			text:"In the editor window you can see the kernel " +
				"code of your first WebCl program. This is " +
				"code that is sent to the graphics card to " +
				"be evaluated. This particular code takes to " +
				"vector arrays, A and B, and adds them " +
				"together into C. This code will be run by " +
				"many separate threads. Each thread is able " +
				"to determine the element it should operate " +
				"on through the <code>get_global_id(0)</code>" +
				". Go ahead and turn this vector addition " +
				"example into a vector multiplication " +
				"example. Hint: kernel code is very similar " +
				"to C, so the multiplication operator is " +
				"<code>*</code>.",
			editor:1,
			editorText: false,
			complete: function(code, user, output) {
				var reg = /C\[x\]\s*=\s*A\[x\]\s*\*\s*B\[x\]\s*;/gi;
				if (reg.exec(code)) {
					return true;
				}
				return false;
			},
			lock: false,
			release: false,
			forceFocus: false,
			allowSkip: false
		},
		{
			text:"Go ahead and run the code a couple times. You " +
				"should be able to see that the vectors are " +
				"randomly generated every time. We are now " +
				"looking at the JavaScript side of an WebCL " +
				"program, where much of the work in setting " +
				"up the kernel code we saw last time happens. " +
				"Navigate through the code to where the " +
				"arrays <code>UIvector1</code> and " +
				"<code>UIvector2</code> are initialized. You " +
				"should see a loop where " +
				"<code>Math.random</code> is being called. " +
				"Replace the right hand side of both " +
				"statements in the loop with i + 1 to make " +
				"sure the code is working!",
			editor:0,
			editorText: false,
			complete: function(code, user, output) {
				var reg1 = /UIvector1\[i\]\s*=\s*i\s*\+\s*1\s*;/gi;
				var reg2 = /UIvector2\[i\]\s*=\s*i\s*\+\s*1\s*;/gi;
				if (reg1.exec(code) && reg2.exec(code)) {
					return true;
				}
				return false;
			},
			gotoText: {0: /UIvector1/},
			lock: false,
			release: false,
			forceFocus: false,
			allowSkip: false
		},
	]
};