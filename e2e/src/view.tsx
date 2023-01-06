import {
  expression as e,
  expression as expr,
  binding as b,
} from "@player-ui/dsl";

const pathA = b`foo.AA`;
const pathB = b`foo.BB`;
const pathC = b`foo['CC']`;

function foo() {}

const x = foo();

const other = expr`containsAny()`;

const testFn = e`replace('foo') + concat() - ''`;

const isTrue = e`${pathA} === ${pathB}`;
