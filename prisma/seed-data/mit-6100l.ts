import type { AssignmentSeed, CourseDetail, QuestionSeed } from "./types";

const OCW =
  "https://ocw.mit.edu/courses/6-100l-introduction-to-cs-and-programming-using-python-fall-2022";

const questions: Record<number, QuestionSeed[]> = {
  1: [
    {
      kind: "conceptual",
      prompt:
        "In a short paragraph, what does this lecture mean by computational thinking? How is that different from solving a problem only with algebra on paper?",
    },
    {
      kind: "conceptual",
      prompt:
        "Explain the difference between an object and the variable name bound to it. What happens to the object if you bind that name to something else?",
    },
    {
      kind: "practice",
      prompt:
        "A script does a = 3, then b = a, then a = 7. What is b afterwards, and why? What would change if a and b named the same mutable list instead of an integer?",
    },
    {
      kind: "conceptual",
      prompt:
        "The lecture separates knowledge of concepts, programming skill, and problem solving. Which part of the course (lectures, finger exercises, problem sets) is meant to train each one?",
    },
    {
      kind: "practice",
      prompt:
        "Name the type of each expression: 4, 4.0, \"4\", and True. Which pairs can you combine with + without a type error, and what does + mean in each successful case?",
    },
  ],
  2: [
    {
      kind: "practice",
      prompt:
        "What does this print, and why? s = \"Cairo\" then print(s[0], s[-1], len(s)). What index would raise an error?",
    },
    {
      kind: "conceptual",
      prompt:
        "Why can you read a character of a string with indexing but not write s[0] = \"K\"? What do you build instead when you want a different string?",
    },
    {
      kind: "practice",
      prompt:
        "Describe the branches you would write so a program prints positive, negative, or zero for a number. Why does the order of the tests matter even when the three cases do not overlap?",
    },
    {
      kind: "conceptual",
      prompt:
        "What does an f-string buy you compared with concatenating pieces? Give a tiny example that mixes a name and a number.",
    },
    {
      kind: "practice",
      prompt:
        "Predict print(\"3\" * 2) and print(3 * 2). What types are involved, and which result would surprise someone who thinks * always means multiplication of numbers?",
    },
  ],
  3: [
    {
      kind: "conceptual",
      prompt:
        "When would you choose a while loop instead of a for loop over a sequence? Give a situation from this lecture's material, not a generic slogan.",
    },
    {
      kind: "practice",
      prompt:
        "Trace i = 0 / while i < 3: print(i); i += 1. What is printed, and what happens if the last line is missing?",
    },
    {
      kind: "practice",
      prompt:
        "Rewrite 'print hello world N times' with a for loop over range. What does range(N) include, and what does it leave out?",
    },
    {
      kind: "conceptual",
      prompt:
        "Where should a variable that accumulates a result be created, relative to the loop? What goes wrong if you create it inside the loop instead?",
    },
    {
      kind: "practice",
      prompt:
        "Trace s = \"ab\" and out = \"\", then for ch in s: out = ch + out. What is out at the end, and what did the loop do to the string?",
    },
  ],
  4: [
    {
      kind: "conceptual",
      prompt:
        "Describe guess-and-check in plain language. What is the guess, what is the check, and what has to change so the loop can finish?",
    },
    {
      kind: "practice",
      prompt:
        "You need the cube root of a positive integer N when N is a perfect cube, and the word error otherwise. What is the largest guess you must try, and why can you stop there?",
    },
    {
      kind: "conceptual",
      prompt:
        "Exhaustive guess-and-check can be correct and still be a bad way to solve a problem. What grows as the search space gets larger, and why does that matter before you have learned a faster method?",
    },
    {
      kind: "practice",
      prompt:
        "For the string python, which characters sit at even indexes? How would you visit only those indexes with range, and what string would you print?",
    },
    {
      kind: "conceptual",
      prompt:
        "Why is repeated division by 2 a natural loop for recovering the binary digits of a positive integer? What do you record on each step?",
    },
  ],
  5: [
    {
      kind: "conceptual",
      prompt:
        "Why is a direct equality test like 0.1 + 0.2 == 0.3 an unreliable way to decide that two floats match? What kind of comparison should you use instead?",
    },
    {
      kind: "conceptual",
      prompt:
        "Describe the approximation method for a square root from this lecture: where you start, how you decide the next guess, and how you know you are close enough.",
    },
    {
      kind: "practice",
      prompt:
        "If a square-root guess is too high, what should the next guess do? What relationship between the guess and the target are you trying to keep as the loop runs?",
    },
    {
      kind: "conceptual",
      prompt:
        "A step that shrinks by a fixed amount can miss the answer or run for a very long time. What job does the epsilon (the allowed error) do in the stopping rule?",
    },
    {
      kind: "practice",
      prompt:
        "Epsilon is 0.01 and the square of your guess is 0.004 below the target. Do you stop? Explain using the stopping rule, not a calculator's printed decimal.",
    },
  ],
  6: [
    {
      kind: "conceptual",
      prompt:
        "What has to be true of a function on an interval before bisection is a valid way to hunt for a root? What do you do with the half of the interval you throw away?",
    },
    {
      kind: "practice",
      prompt:
        "You are guessing a secret integer from 0 through 100 inclusive, and when the halfway point falls between two integers you choose the smaller one. What is the first midpoint, and what question do you ask next?",
    },
    {
      kind: "conceptual",
      prompt:
        "Compare bisection with linear guess-and-check. What do you gain, and what property of the problem do you have to give the algorithm in return?",
    },
    {
      kind: "conceptual",
      prompt:
        "In one short paragraph, what is the idea of Newton-Raphson for square roots, and why does it usually take fewer steps than bisection on the same problem?",
    },
    {
      kind: "practice",
      prompt:
        "A bisection search over 0 to 100 reports count: 4 and answer: 20. Is a count that small plausible? Argue from how the range shrinks, not from running code.",
    },
  ],
  7: [
    {
      kind: "conceptual",
      prompt:
        "What is the difference between decomposition and abstraction? Use a function that evaluates a quadratic as the example.",
    },
    {
      kind: "practice",
      prompt:
        "A specification says the function returns a*x*x + b*x + c and does not print. What is wrong with an implementation that prints the value and has no return?",
    },
    {
      kind: "conceptual",
      prompt:
        "Why does the lecture want a docstring that names the arguments and the return value before you fill in the body? Who is that docstring for while you are still writing the function?",
    },
    {
      kind: "practice",
      prompt:
        "A function prints the sum of two quadratic evaluations and returns None. What appears if the caller prints the result of the call, and why are there two lines of output?",
    },
    {
      kind: "conceptual",
      prompt:
        "Give one function that is too small to be worth naming, and one that is trying to do too many jobs. What test do you use to tell them apart?",
    },
  ],
  8: [
    {
      kind: "conceptual",
      prompt:
        "What does a function's local environment contain, and what happens to those bindings when the function returns?",
    },
    {
      kind: "practice",
      prompt:
        "The caller has x = 5. The function assigns x = 1 in its body and returns. What is the caller's x afterwards, and why?",
    },
    {
      kind: "conceptual",
      prompt:
        "What does it mean that a function is an object in Python? Name one thing you can do with a function that you can also do with an integer.",
    },
    {
      kind: "practice",
      prompt:
        "same_chars should return True only when two strings use exactly the same set of characters. For \"abccc\" and \"caaab\", what is the result, and which Python type lets you ignore order and duplicates?",
    },
    {
      kind: "conceptual",
      prompt:
        "Why is reading a global variable from inside a function a problem for testing, even when the function seems to work in your script?",
    },
  ],
  9: [
    {
      kind: "conceptual",
      prompt:
        "When is a lambda a better fit than a def, and when does a lambda make the code harder to test or to read?",
    },
    {
      kind: "practice",
      prompt:
        "What does (lambda x: x + 1)(4) evaluate to? Write the named function that does the same thing, including what it returns.",
    },
    {
      kind: "conceptual",
      prompt:
        "Give two differences between a tuple and a list that should change which one you return from a function.",
    },
    {
      kind: "practice",
      prompt:
        "dot_product((1, 2, 3), (4, 5, 6)) returns a tuple of the shared length and the sum of pairwise products. Compute that tuple by hand and show the three products you added.",
    },
    {
      kind: "conceptual",
      prompt:
        "Why does this lecture introduce tuples and lists next to functions, instead of treating them only as bags of data? What can you do with a list of functions that you cannot do with a list of numbers alone?",
    },
  ],
  10: [
    {
      kind: "conceptual",
      prompt:
        "What does it mean for a list to be mutable? Name one operation that mutates a list and one that builds a new list and leaves the original alone.",
    },
    {
      kind: "practice",
      prompt:
        "After L = [1, 2], M = L, and L.append(3), what is M? Explain using aliasing, not a second copy.",
    },
    {
      kind: "conceptual",
      prompt:
        "The lecture warns about looping over a list while you mutate it. Describe a concrete way that goes wrong, and a safer pattern for removing elements.",
    },
    {
      kind: "practice",
      prompt:
        "all_true(n, Lf) returns True only when every function in Lf returns True for n. What should it return when Lf is empty, and why is that the consistent answer?",
    },
    {
      kind: "conceptual",
      prompt:
        "Two variables can refer to one list. Two variables bound to the integer 3 do not share a mutable 3. Why is that distinction worth keeping straight before you write functions that take lists?",
    },
  ],
  11: [
    {
      kind: "conceptual",
      prompt:
        "What is the difference between an alias and a clone? When is a shallow copy not enough?",
    },
    {
      kind: "practice",
      prompt:
        "Start with L = [[1], [2]] and M = L[:], then M[0].append(9). What is L afterwards, and what does that tell you about slicing?",
    },
    {
      kind: "practice",
      prompt:
        "remove_and_sort mutates its list: it drops the first k elements and sorts what remains. For [1, 6, 3] and k = 1, what is the list after the call? What should the list be when k is longer than the list?",
    },
    {
      kind: "conceptual",
      prompt:
        "Why does a function whose job is to mutate a list return None? What bug appears if a caller writes L = remove_and_sort(L, 1) and ignores that contract?",
    },
    {
      kind: "practice",
      prompt:
        "Write, in one line of words or code, a list comprehension that builds the squares of the even numbers in range(10). What do you give up by doing that work in a comprehension instead of a loop you can debug line by line?",
    },
  ],
  12: [
    {
      kind: "conceptual",
      prompt:
        "Contrast black-box testing and glass-box testing. What is each one allowed to know about the function?",
    },
    {
      kind: "practice",
      prompt:
        "count_sqrts([3, 4, 2, 1, 9, 25]) counts how many values are exact squares of some value in the same list, including a number that is a square of itself. Which three values are counted, and why is 4 counted?",
    },
    {
      kind: "conceptual",
      prompt:
        "What is a keyword argument for, and how is a default argument a related but different tool? Give a one-line signature that uses a default.",
    },
    {
      kind: "practice",
      prompt:
        "A specification says the function returns 3. An implementation returns 3.0. Is that a failure? Argue from the specification, not from how you would have written the body.",
    },
    {
      kind: "conceptual",
      prompt:
        "Why is a test you can re-run a better debugging tool than a print you delete once the bug seems gone?",
    },
  ],
  13: [
    {
      kind: "conceptual",
      prompt:
        "When should code raise an exception instead of returning a sentinel such as -1 or None? What does the caller gain?",
    },
    {
      kind: "conceptual",
      prompt:
        "What is the difference between an assertion and an exception you raise on purpose? Who is each one talking to?",
    },
    {
      kind: "practice",
      prompt:
        "sum_str_lengths sums the lengths of strings in a list that may contain sublists of strings, and raises ValueError if it sees anything else. What does it return for [\"abcd\", [\"e\", \"fg\"]]? What should happen for [12, [\"e\", \"fg\"]], and where would you check?",
    },
    {
      kind: "conceptual",
      prompt:
        "Why is a bare except a bad way to handle a bug you do not understand yet? What information do you throw away?",
    },
    {
      kind: "practice",
      prompt:
        "An assertion fails in the middle of a problem set. What does that tell you about the state just before the failing line, and what is the first question you should ask?",
    },
  ],
  14: [
    {
      kind: "conceptual",
      prompt:
        "What is the contract of a dictionary key? Why are lists a poor choice for keys, while tuples of numbers are acceptable?",
    },
    {
      kind: "practice",
      prompt:
        "keys_with_value({1: 2, 2: 4, 5: 2}, 2) returns the sorted list of keys whose value is 2. What is that list? What do you return if the target value is missing?",
    },
    {
      kind: "practice",
      prompt:
        "all_positive maps an int to a list of ints and returns the sorted keys whose lists sum to a positive number. For {5: [2, -4], 2: [1, 2, 3], 1: [2]}, which keys qualify? Show the sum you computed for key 5.",
    },
    {
      kind: "conceptual",
      prompt:
        "A for loop over a dictionary yields keys, not pairs. How do you visit keys and values together, and why should you not add or delete keys while you do?",
    },
    {
      kind: "conceptual",
      prompt:
        "Give an example, in words, of a computation in this course that a dictionary can turn from repeated work into a lookup. You do not need the full algorithm.",
    },
  ],
  15: [
    {
      kind: "conceptual",
      prompt:
        "State the two parts every recursive function needs. What happens at runtime if the second one is missing?",
    },
    {
      kind: "practice",
      prompt:
        "By hand, compute recur_power(2, 5) the way the recursive function does. Write the chain of calls down to the base case and the values coming back up.",
    },
    {
      kind: "conceptual",
      prompt:
        "Why is the base case exp == 0 returning 1 the right base for power, including a nonzero base raised to the power 0?",
    },
    {
      kind: "conceptual",
      prompt:
        "When is an ordinary loop clearer than recursion for the same specification, and when does recursion match the definition more closely? Use power or a list walk as the example.",
    },
    {
      kind: "practice",
      prompt:
        "The specification says exp >= 0. What happens if someone calls recur_power(2, -1) anyway? Describe the failure, and where you would put a guard.",
    },
  ],
  16: [
    {
      kind: "conceptual",
      prompt:
        "How is the base case different when you recurse on a list or a string, compared with recursing on a smaller integer?",
    },
    {
      kind: "practice",
      prompt:
        "For flatten([[1, 4, [6], 2], [[[3]], 2], 4, 5]), describe the first step: is the first element a number or a list you must flatten further? What list do you expect at the end?",
    },
    {
      kind: "conceptual",
      prompt:
        "Plain recursive Fibonacci repeats a lot of work. How does a dictionary change the algorithm without changing the mathematical definition of Fibonacci?",
    },
    {
      kind: "conceptual",
      prompt:
        "Towers of Hanoi shows up as an extra in this lecture. In one paragraph, what are the three steps of moving a tower, and what is the base case?",
    },
    {
      kind: "practice",
      prompt:
        "A recursive function on strings returns its input unchanged when the string is empty. Is that a plausible base case for reversing a string? Describe the recursive case in words.",
    },
  ],
  17: [
    {
      kind: "conceptual",
      prompt:
        "What is the difference between a class and an instance? Where do the methods live, and where does radius live for a particular Circle?",
    },
    {
      kind: "practice",
      prompt:
        "A Circle uses pi = 3.14 and has radius 2. What should get_area return? Show the arithmetic.",
    },
    {
      kind: "conceptual",
      prompt:
        "Why does set_radius change an existing object instead of returning a new one? When would returning a new object be the better design?",
    },
    {
      kind: "practice",
      prompt:
        "equal should compare two circles by radius. What is wrong with writing return self == c if you have not defined how equality works for Circle?",
    },
    {
      kind: "conceptual",
      prompt:
        "The lecture calls this data abstraction. What is hidden from the caller of get_area, and why is that a useful boundary?",
    },
  ],
  18: [
    {
      kind: "conceptual",
      prompt:
        "What is a dunder method? Why does Python look up __str__ when you print an object?",
    },
    {
      kind: "practice",
      prompt:
        "__add__ should return a new Circle whose radius is the sum of the two radii. If both radii are 3, what is the radius of the result, and what should print show if __str__ returns the radius?",
    },
    {
      kind: "conceptual",
      prompt:
        "Why should __add__ return a new Circle instead of mutating self? What bug appears if it both mutates and returns self?",
    },
    {
      kind: "conceptual",
      prompt:
        "__init__ is not a method where you write return self. What do you do inside it, and what does Python do with the instance afterwards?",
    },
    {
      kind: "practice",
      prompt:
        "You wrote __str__ but printing the circle still looks like a default object dump. Name two reasons that can happen, related to the method's return value or which object you are printing.",
    },
  ],
  19: [
    {
      kind: "conceptual",
      prompt:
        "What does a subclass inherit from its superclass, and what does it mean to override a method?",
    },
    {
      kind: "practice",
      prompt:
        "A Stack adds elements at one end and remove takes off the newest one. If you add 1, then 2, then 3, what does the first remove return? What does remove return when the stack is empty, according to the usual specification for this exercise?",
    },
    {
      kind: "conceptual",
      prompt:
        "Why is a stack described as last-in, first-out? Which end of a Python list would you use so that remove stays consistent with add, and why?",
    },
    {
      kind: "conceptual",
      prompt:
        "If you forget to implement remove on Stack, what does a caller get? Why is that a design mistake even when Python does not immediately crash?",
    },
    {
      kind: "practice",
      prompt:
        "size is implemented on Container. Does Stack need its own size? Inside Stack.remove, what object does self.myList refer to?",
    },
  ],
  20: [
    {
      kind: "conceptual",
      prompt:
        "The fitness-tracker lecture is an object-oriented design example, not a new piece of syntax. What design question is it answering that the first class lecture did not?",
    },
    {
      kind: "practice",
      prompt:
        "A Queue removes the oldest element. If you add \"a\", then \"b\", then \"c\", what does the first remove return? How is that different from the Stack in the previous lecture?",
    },
    {
      kind: "conceptual",
      prompt:
        "Why can Queue reuse add and size without copying their code? What would you lose by pasting those methods into Queue?",
    },
    {
      kind: "conceptual",
      prompt:
        "The exercise says to keep the end you add to consistent. What bug appears if add sometimes appends and sometimes inserts at the front?",
    },
    {
      kind: "practice",
      prompt:
        "Name two pieces of state you would expect on a fitness-tracker style object that accumulates activity over time, and one method that should change that state rather than return a fresh copy.",
    },
  ],
  21: [
    {
      kind: "conceptual",
      prompt:
        "Why is wall-clock timing a shaky way to compare two algorithms, even when you run both on your own machine?",
    },
    {
      kind: "conceptual",
      prompt:
        "What does it mean to count operations instead of seconds? Which operations are worth counting in a loop that scans a list once?",
    },
    {
      kind: "practice",
      prompt:
        "A loop runs once per element of a list of length n and does a constant amount of work each time. How does the operation count grow when n doubles?",
    },
    {
      kind: "conceptual",
      prompt:
        "This lecture has no finger exercise. What single idea are you supposed to carry into the Big-Oh lecture, in one sentence?",
    },
    {
      kind: "practice",
      prompt:
        "You time a function at n = 1000 and n = 2000. The second run takes about four times as long, not twice. What does that suggest about the growth, and why is one pair of timings not proof?",
    },
  ],
  22: [
    {
      kind: "conceptual",
      prompt:
        "In your own words, what extra claim does theta make that Big-Oh does not?",
    },
    {
      kind: "practice",
      prompt:
        "Simplify n*n + log(n) + 2**a when n grows and a is a constant. What is theta in terms of n, and which term did you keep?",
    },
    {
      kind: "practice",
      prompt:
        "Simplify 2**n + n*log(n) + n**2 as n grows. Which term dominates, and why can you drop the others?",
    },
    {
      kind: "practice",
      prompt:
        "The lecture's third exercise asks you to simplify f*log(f) + 100000 + 300*a + x*y*z 'in terms of n'. What is missing from that expression before you can name a theta class?",
    },
    {
      kind: "conceptual",
      prompt:
        "Why do we drop constant factors when we write O(n) for a loop that scans a list twice? When would a constant factor still matter to you as the person who has to run the program?",
    },
  ],
  23: [
    {
      kind: "practice",
      prompt:
        "running_product multiplies integers from 5 through a+4 and can return early. If n = a, what is the worst-case order of growth? What kind of input avoids the early return?",
    },
    {
      kind: "practice",
      prompt:
        "tricky_f loops over a list L of length n and, for each element, tests membership in a second list of length n, then does the same the other way. What is the worst-case order, and where does the extra factor come from?",
    },
    {
      kind: "practice",
      prompt:
        "sum_f repeatedly replaces n with n//10 and adds a digit until n is 0. How does the number of loop trips grow with the input number? Say it in terms of digits or of a logarithm.",
    },
    {
      kind: "conceptual",
      prompt:
        "Why do we bother to say 'worst case'? Give a one-line example of an input that makes running_product return earlier than that worst case.",
    },
    {
      kind: "conceptual",
      prompt:
        "Linear search and bisection search are both in this lecture. What assumption does bisection need that linear search does not, and what growth do you get in return?",
    },
  ],
  24: [
    {
      kind: "conceptual",
      prompt:
        "Describe bubble sort, selection sort, and merge sort in one sentence each, aimed at a future you who has forgotten the pictures.",
    },
    {
      kind: "conceptual",
      prompt:
        "Why is bogosort a useful example in a lecture even though nobody should ship it? What does it make obvious about the cost of a sort?",
    },
    {
      kind: "practice",
      prompt:
        "For a list of length n, what theta class describes the number of adjacent comparisons bubble sort can do in the worst case? You do not need the exact leading constant.",
    },
    {
      kind: "conceptual",
      prompt:
        "Merge sort spends extra memory on temporary lists. What growth do you get for the comparisons, and what resource did you spend to get it?",
    },
    {
      kind: "practice",
      prompt:
        "Two records can share a key, for example two students with the same grade. Why would you care whether a sort keeps their original relative order? Which of bubble sort and selection sort is the one that does?",
    },
  ],
  25: [
    {
      kind: "conceptual",
      prompt:
        "What is a plot for in this course, as opposed to printing every number? When is a figure the better way to check that a program did what you think?",
    },
    {
      kind: "conceptual",
      prompt:
        "The lecture uses a visualization library on top of Python. What has to be true of the data before a chart can show something the raw list was hiding?",
    },
    {
      kind: "practice",
      prompt:
        "You plot the number of bisection guesses against the size of the search range. What shape do you expect, and what would a straight line through the origin suggest instead?",
    },
    {
      kind: "conceptual",
      prompt:
        "Name two ways a plot can mislead you about an algorithm: one about the axes, and one about which input sizes you chose to draw.",
    },
    {
      kind: "conceptual",
      prompt:
        "Problem set 5 is due before this lecture. What can a plot of your own results explain that a single returned number cannot?",
    },
  ],
  26: [
    {
      kind: "conceptual",
      prompt:
        "The lecture separates the list you see in Python from how that list sits in memory. Why can appending sometimes be cheap and sometimes force a larger copy?",
    },
    {
      kind: "conceptual",
      prompt:
        "What problem is hashing solving in a dictionary lookup, and what do you give up compared with keeping a sorted list?",
    },
    {
      kind: "conceptual",
      prompt:
        "A simulation in this lecture is a model you step forward in time. What makes that a computational solution rather than a closed-form formula?",
    },
    {
      kind: "practice",
      prompt:
        "You want to know how often a fair die shows 6 in 10,000 rolls. Why is a simulation an appropriate tool, and what would make you distrust a single run?",
    },
    {
      kind: "conceptual",
      prompt:
        "Look back at the course. Pick one idea from the first half (control flow, functions, or data) and one from the second half (objects or complexity) and say how they would meet in a program you would actually write.",
    },
  ],
};

const fingerSummaries: Record<number, string> = {
  1: "Combine three given numbers into one result and print it.",
  2: "Classify a number as positive, negative, or zero.",
  3: "Print a line N times with a loop.",
  4: "Find the cube root of a perfect cube, or report that it is not one.",
  5: "Build the string of even-indexed characters.",
  6: "Use bisection to find a hidden integer and report how many guesses it took.",
  7: "Evaluate one quadratic, then print the sum of two quadratics without returning that sum.",
  8: "Decide whether two strings use the same set of characters.",
  9: "Return the length and the dot product of two tuples.",
  10: "Ask whether every function in a list accepts an integer.",
  11: "Drop a prefix of a list and sort what remains, in place.",
  12: "Count values that are squares of other values in the same list.",
  13: "Sum string lengths in a nested list, or raise ValueError.",
  14: "Collect keys with a given value, and keys whose lists sum to a positive number.",
  15: "Compute an integer power by recursion.",
  16: "Flatten a nested list by recursion.",
  17: "Implement a Circle with radius, area, and comparisons.",
  18: "Add two circles and give a circle a useful string form, using dunder methods.",
  19: "Implement a Stack that removes the newest element.",
  20: "Implement a Queue that removes the oldest element.",
  22: "Drop dominated terms and name the theta class.",
  23: "Give the worst-case order of growth for three short functions.",
};

const pageSlug = [
  "lecture-1-introduction",
  "lecture-2-strings-inputoutput-branching",
  "lecture-3-iteration",
  "lecture-4-loops-over-strings-guess-and-check-binary",
  "lecture-5-floats-and-approximation-methods",
  "lecture-6-bisection-search",
  "lecture-7-decomposition-abstraction-functions",
  "lecture-8-functions-as-objects",
  "lecture-9-lambda-functions-tuples-and-lists",
  "lecture-10-lists-mutability",
  "lecture-11-aliasing-cloning",
  "lecture-12-list-comprehension-functions-as-objects-testing-debugging",
  "lecture-13-exceptions-assertions",
  "lecture-14-dictionaries",
  "lecture-15-recursion",
  "lecture-16-recursion-on-non-numerics",
  "lecture-17-python-classes",
  "lecture-18-more-python-class-methods",
  "lecture-19-inheritance",
  "lecture-20-fitness-tracker-object-oriented-programming-example",
  "lecture-21-timing-programs-counting-operations",
  "lecture-22-big-oh-and-theta",
  "lecture-23-complexity-classes-examples",
  "lecture-24-sorting-algorithms",
  "lecture-25-plotting",
  "lecture-26-list-access-hashing-simulations-and-wrap-up",
];

const titles = [
  "Introduction to CS and Programming Using Python",
  "Strings, Input/Output, and Branching",
  "Iteration",
  "Loops over Strings, Guess-and-Check, and Binary",
  "Floats and Approximation Methods",
  "Bisection Search",
  "Decomposition, Abstraction, and Functions",
  "Functions as Objects",
  "Lambda Functions, Tuples, and Lists",
  "Lists and Mutability",
  "Aliasing and Cloning",
  "List Comprehension, Functions as Objects, Testing, and Debugging",
  "Exceptions and Assertions",
  "Dictionaries",
  "Recursion",
  "Recursion on Non-numerics",
  "Python Classes",
  "More Python Class Methods",
  "Inheritance",
  "Fitness Tracker Object-Oriented Programming Example",
  "Timing Programs and Counting Operations",
  "Big Oh and Theta",
  "Complexity Classes Examples",
  "Sorting Algorithms",
  "Plotting",
  "List Access, Hashing, Simulations, and Wrap-Up",
];

const summaries = [
  "Course shape, computational thinking, and the first Python objects: types, variables, and bindings in an IDE.",
  "Strings, indexing, input and output, f-strings, operators, and branching.",
  "Control flow with while and for, and loops that accumulate a result.",
  "Loops over strings, exhaustive guess-and-check, and recovering binary digits.",
  "Why floats surprise you, and an approximation loop for square roots.",
  "Bisection search and the idea of Newton-Raphson. Lectures 6 and 10 on the OCW playlist were updated after the first upload.",
  "Functions as a way to decompose a problem, with specifications that say what is returned.",
  "Scope, environments, and the fact that functions are objects you can pass around.",
  "Lambda expressions, tuples, and the first look at lists.",
  "List operations, mutation, and the aliasing bugs that mutation creates.",
  "Aliasing versus cloning, shallow copies, and list comprehensions.",
  "Keyword and default arguments, then black-box tests, glass-box tests, and a disciplined way to debug.",
  "Raising exceptions, catching them, and assertions as checks aimed at the programmer.",
  "Dictionaries: keys, values, mutability, and iteration.",
  "Recursion versus iteration, and inductive reasoning with a numeric base case.",
  "Fibonacci, memoizing with a dictionary, and recursion on lists and other non-numeric structures.",
  "Classes, instances, and methods. Data abstraction with a small Circle.",
  "Special methods: constructing, printing, and adding objects.",
  "Subclasses, overriding, and using methods you inherited.",
  "A longer object-oriented example, a fitness tracker, plus the queue as the contrast to a stack.",
  "Measuring cost by the clock and by counting operations. There is no finger exercise for this lecture.",
  "Big-Oh as an upper bound and theta when the bound is tight.",
  "Worked complexity classes, including linear search and bisection.",
  "Bogo sort, bubble sort, selection sort, and merge sort. There is no finger exercise.",
  "Plots as a way to see the result of a computation. There is no finger exercise. Problem set 5 is due before this lecture.",
  "How lists sit in memory, hashing, simulations, and a wrap-up of the course. There is no finger exercise.",
];

const readings = [
  "Guttag, Ch 1 and Ch 2.1–2.2",
  "Guttag, Ch 2.3–2.4",
  "Guttag, Ch 2.5–2.8",
  "Guttag, Ch 3.1 and 3.3",
  "Guttag, Ch 3.2–3.3",
  "Guttag, Ch 3.4–3.5",
  "Guttag, Ch 4.1–4.2",
  "Guttag, Ch 4.3–4.6",
  "Guttag, Ch 5.1–5.3",
  "Guttag, Ch 5.3–5.5",
  "Guttag, Ch 5.3–5.5",
  "Guttag, Ch 4.4 and Ch 8",
  "Guttag, Ch 9",
  "Guttag, Ch 5.7",
  "Guttag, Ch 6.1",
  "Guttag, Ch 6.2–6.4",
  "Guttag, Ch 10.1",
  "Guttag, Ch 10.1",
  "Guttag, Ch 10.2",
  "Guttag, Ch 10.4",
  "Guttag, Ch 11",
  "Guttag, Ch 11",
  "Guttag, Ch 12.1",
  "Guttag, Ch 12.2",
  "Guttag, Ch 13",
  "Guttag, Ch 12.3 and Ch 17",
];

/** Verified with yt-dlp against playlist PLUl4u3cNGP62A-ynp6v6-LGBCzeH3VAQB on 13 Nov 2026. */
const youtubeIds = [
  "xAcTmDO6NTI",
  "UdEX0E9lIQM",
  "lzYrMcI92kw",
  "fWNZAw5Bmco",
  "OF2sr5e7PrY",
  "PJ_5VNvJGtA",
  "Qf6OVR8MLnU",
  "0fEJFRKJN4U",
  "h5abkZ_Ch6c",
  "Z4bm7xzYpKM",
  "hpsp-LQurco",
  "AZBxs3OvFrY",
  "qT3_7FMuv-U",
  "lTgLOuaQsvk",
  "Bbyp4VRbmyY",
  "2XxGplWqXVQ",
  "tsMrUdynbQQ",
  "gLnCmUkgUQk",
  "rgM7Z9BNm1s",
  "-wyc5FwzkcM",
  "lvp4NfED6K4",
  "RJhoT5PEf_0",
  "loX34ct0hxs",
  "R8Rw9mIa7JQ",
  "Jov7G7IpuLo",
  "4H0GXzQ41t0",
];

const durations = [
  3810, 4738, 2802, 4396, 2831, 4467, 2754, 4666, 2726, 4513, 2777, 4546, 2576,
  4686, 2719, 4673, 2868, 4646, 4615, 4744, 1932, 4836, 4878, 2859, 4674, 4352,
];

const zipLectures = new Set([12, 20, 25]);

function codeFile(n: number): string {
  const nn = String(n).padStart(2, "0");
  const ext = zipLectures.has(n) ? "zip" : "py";
  return `${OCW}/mit6_100l_f22_lec${nn}_code.${ext}`;
}

const problemSets: AssignmentSeed[] = [
  {
    kind: "problem_set",
    code: "PS0",
    title: "Problem set 0",
    summary:
      "Ungraded practice, handed out with lecture 1. Do it before lecture 2. Open the PDF for the real problems and the zip for the starter code.",
    url: `${OCW}/mit6_100l_f22_ps0.pdf`,
    codeUrl: `${OCW}/mit6_100l_f22_ps0_code.zip`,
    dueBeforeLectureNumber: 2,
    releasedAtLectureNumber: 1,
    graded: false,
  },
  {
    kind: "problem_set",
    code: "PS1",
    title: "Problem set 1",
    summary:
      "Handed out with lecture 2. The calendar also has a halfway hand-in around lecture 5. Due before lecture 9.",
    url: `${OCW}/mit6_100l_f22_ps1.pdf`,
    codeUrl: `${OCW}/mit6_100l_f22_ps1_code.zip`,
    dueBeforeLectureNumber: 9,
    releasedAtLectureNumber: 2,
    graded: true,
  },
  {
    kind: "problem_set",
    code: "PS2",
    title: "Problem set 2",
    summary: "Handed out when problem set 1 is due. Due before lecture 12.",
    url: `${OCW}/mit6_100l_f22_ps2.pdf`,
    codeUrl: `${OCW}/mit6_100l_f22_ps2_code.zip`,
    dueBeforeLectureNumber: 12,
    releasedAtLectureNumber: 9,
    graded: true,
  },
  {
    kind: "problem_set",
    code: "PS3",
    title: "Problem set 3",
    summary: "Handed out when problem set 2 is due. Due before lecture 16.",
    url: `${OCW}/mit6_100l_f22_ps3.pdf`,
    codeUrl: `${OCW}/mit6_100l_f22_ps3_code.zip`,
    dueBeforeLectureNumber: 16,
    releasedAtLectureNumber: 12,
    graded: true,
  },
  {
    kind: "problem_set",
    code: "PS4",
    title: "Problem set 4",
    summary: "Handed out when problem set 3 is due. Due before lecture 20.",
    url: `${OCW}/mit6_100l_f22_ps4.pdf`,
    codeUrl: `${OCW}/mit6_100l_f22_ps4_code.zip`,
    dueBeforeLectureNumber: 20,
    releasedAtLectureNumber: 16,
    graded: true,
  },
  {
    kind: "problem_set",
    code: "PS5",
    title: "Problem set 5",
    summary: "Handed out when problem set 4 is due. Due before lecture 25.",
    url: `${OCW}/mit6_100l_f22_ps5.pdf`,
    codeUrl: `${OCW}/mit6_100l_f22_ps5_code.zip`,
    dueBeforeLectureNumber: 25,
    releasedAtLectureNumber: 20,
    graded: true,
  },
];

const fingers: AssignmentSeed[] = Object.entries(fingerSummaries).map(
  ([key, summary]) => {
    const n = Number(key);
    return {
      kind: "finger" as const,
      code: `FE${n}`,
      title: `Finger exercise, lecture ${n}`,
      summary: `${summary} The official prompt is on the lecture page. Solutions are on the OCW finger-exercise page and are not copied into this app.`,
      url: `${OCW}/pages/${pageSlug[n - 1]}/`,
      solutionsUrl: `${OCW}/pages/finger-exercises/`,
      lectureNumber: n,
      graded: true,
    };
  },
);

export const mit6100l: CourseDetail = {
  courseId: "intro-python",
  lectures: titles.map((title, index) => {
    const number = index + 1;
    const nn = String(number).padStart(2, "0");
    return {
      number,
      title,
      summary: summaries[index],
      readings: readings[index],
      youtubeId: youtubeIds[index],
      durationSeconds: durations[index],
      pageUrl: `${OCW}/pages/${pageSlug[index]}/`,
      slidesUrl: `${OCW}/mit6_100l_f22_lec${nn}.pdf`,
      codeUrl: codeFile(number),
      questions: questions[number],
    };
  }),
  assignments: [...fingers, ...problemSets],
};

export const verified6100lIds = youtubeIds;
