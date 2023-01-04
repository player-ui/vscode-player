import {
  expression as e,
  expression as expr,
  binding as b,
} from "@player-ui/dsl";

const pathA = b`foo.AA`;
const pathB = b`foo.BB`;
const pathC = b`foo['CC']`;

const other = expr`foo()`;

const testFn = e`test`;

const isTrue = e`${pathA} === ${pathB}`;
