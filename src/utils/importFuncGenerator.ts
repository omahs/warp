import { ParameterList, SourceUnit } from 'solc-typed-ast';
import { CairoImportFunctionDefinition } from '../ast/cairoNodes';
import { AST } from '../ast/ast';
import {
  BITWISE_PTR,
  DICT_PTR,
  Implicits,
  KECCAK_PTR,
  RANGE_CHECK_PTR,
  WARP_MEMORY,
} from '../utils/implicits';
import { createParameterList } from './nodeTemplates';
import { assert } from 'console';

export function createImportFuncDefinition(path: string, name: string, node: SourceUnit, ast: AST) {
  // First check if the import was already added. If so, there's no need to add it again.
  const foundImportFuncDef = findExistingImport(name, node);
  if (foundImportFuncDef !== undefined) {
    return foundImportFuncDef;
  }

  // Some cases accept all functions no mater the amount of bits e.g. 'warp_int{N}_to_int{N}' | N mod 8 = 0; 8 <= N <= 256;
  // the else block 'path+name' is to make sure that the case isn't trigged if import name isn't matched.
  switch (path + name) {
    case STARKWARE_CAIRO_COMMON_ALLOC + ALLOC:
      return createAllocImportFuncDef(node, ast);
    case STARKWARE_CAIRO_COMMON_CAIROBUILTINS + BITWISE_BUILTIN:
      return createBitwiseBuiltinImportFuncDef(node, ast);
    case STARKWARE_CAIRO_COMMON_DICT + DICT_WRITE:
      return createDictWriteImportFuncDef(node, ast);
    case STARKWARE_CAIRO_COMMON_MATH_CMP + IS_LE_FELT:
      return createIsLeFeltImportFuncDef(node, ast);
    case STARKWARE_CAIRO_COMMON_UINT256 + UINT256:
      return createUint256ImportFuncDef(node, ast);
    case WARPLIB_MATHS_BYTES_ACCESS + BYTE256_AT_INDEX:
      return createByte256AtIndexImportFuncDef(node, ast);
    case WARPLIB_MATHS_BYTES_CONVERSIONS + WARP_BYTES_WIDEN:
      return createWarpBytesWidenImportFuncDef(node, ast);
    case WARPLIB_MATHS_BYTES_CONVERSIONS + WARP_BYTES_WIDEN_256:
      return createWarpBytesWiden256ImportFuncDef(node, ast);
    case WARPLIB_MATHS_EXTERNAL_INPUT_CHECK_ADDRESS + WARP_EXTERNAL_INPUT_CHECK_ADDRESS:
      return createWarpExternalInputCheckAddressImportFuncDef(node, ast);
    case WARPLIB_MATHS_EXTERNAL_INPUT_CHECK_BOOL + WARP_EXTERNAL_INPUT_CHECK_BOOL:
      return createWarpExternalInputCheckBoolImportFuncDef(node, ast);
    case WARPLIB_MATHS_EXTERNAL_INPUT_CHECK_INTS +
      (isWarp_external_input_check_intN(name) ? name : path + name):
      return createWarpExternalInputCheckIntNImportFuncDef(name, node, ast);
    case WARPLIB_MATHS_INT_CONVERSIONS + (isWarp_intN_to_intN(name) ? name : path + name):
      return createWarpIntNToIntNImportFuncDef(name, node, ast);
    case WARPLIB_MATHS_INT_CONVERSIONS + WARP_UINT256:
      return createWarpUint256ImportFuncDef(node, ast);
    case WARPLIB_MATHS_UTILS + FELT_TO_UINT256:
      return createFelt2Uint256ImportFuncDef(node, ast);
    case WARPLIB_MATHS_UTILS + NARROW_SAFE:
      return createNarrowSafeImportFuncDef(node, ast);
    case WARPLIB_DYNAMIC_ARRAYS_UTIL + BYTE_ARRAY_TO_FELT_VALUE:
      return createByteArrayToFeltValueImportFuncDef(node, ast);
    case WARPLIB_DYNAMIC_ARRAYS_UTIL + BYTE_ARRAY_TO_UINT256_VALUE:
      return createByteArrayToUint256ValueImportFuncDef(node, ast);
    case WARPLIB_DYNAMIC_ARRAYS_UTIL + BYTES_TO_FELT_DYNAMIC_ARRAY:
      return createBytesToFeltDynamicArrayImportFuncDef(node, ast);
    case WARPLIB_DYNAMIC_ARRAYS_UTIL + BYTES_TO_FELT_DYNAMIC_ARRAY_SPL:
      return createBytesToFeltDynamicArraySplImportFuncDef(node, ast);
    case WARPLIB_DYNAMIC_ARRAYS_UTIL + BYTES_TO_FELT_DYNAMIC_ARRAY_SPL_WITHOUT_PADDING:
      return createBytesToFeltDynamicArraySplWithoutPaddingImportFuncDef(node, ast);
    case WARPLIB_DYNAMIC_ARRAYS_UTIL + FIXED_BYTES256_TO_FELT_DYNAMIC_ARRAY:
      return createFixedBytes256ToFeltDynArrayImportFuncDef(node, ast);
    case WARPLIB_DYNAMIC_ARRAYS_UTIL + FIXED_BYTES256_TO_FELT_DYNAMIC_ARRAY_SPL:
      return createFixedBytes256ToFeltDynArraySplImportFuncDef(node, ast);
    case WARPLIB_DYNAMIC_ARRAYS_UTIL + FIXED_BYTES_TO_FELT_DYNAMIC_ARRAY:
      return createFixedBytesToFeltDynArrayImportFuncDef(node, ast);
    case WARPLIB_DYNAMIC_ARRAYS_UTIL + FELT_ARRAY_TO_WARP_MEMORY_ARRAY:
      return createFeltArray2WarpMemoryArrayImportFuncDef(node, ast);
    case WARPLIB_DYNAMIC_ARRAYS_UTIL + MEMORY_DYN_ARRAY_COPY:
      return createMemoryDynArrayCopyImportFuncDef(node, ast);
    case WARPLIB_DYNAMIC_ARRAYS_UTIL + DYNAMIC_ARRAY_COPY_FELT:
      return createDynamicArrayCopyFeltImportFuncDef(node, ast);
    case WARPLIB_DYNAMIC_ARRAYS_UTIL + FIXED_BYTES_TO_DYNAMIC_ARRAY:
      return createFixedBytesToDynamicArrayImportFuncDef(node, ast);
    case WARPLIB_DYNAMIC_ARRAYS_UTIL + FIXED_BYTES256_TO_DYNAMIC_ARRAY:
      return createFixedBytes256ToDynamicArrayImportFuncDef(node, ast);
    case WARPLIB_MEMORY + WM_ALLOC:
      return createWMAllocImportFuncDef(node, ast);
    case WARPLIB_MEMORY + WM_DYN_ARRAY_LENGTH:
      return createWMDynArrayLengthImportFuncDef(node, ast);
    case WARPLIB_MEMORY + WM_INDEX_DYN:
      return createWMIndexDynImportFuncDef(node, ast);
    case WARPLIB_MEMORY + WM_NEW:
      return createWMNewImportFuncDef(node, ast);
    case WARPLIB_KECCAK + WARP_KECCAK:
      return createWarpKeccakImportFuncDef(node, ast);
    default:
      // TODO: Throw a not matched import error
      break;
  }
}

// Paths
const STARKWARE_CAIRO_COMMON_ALLOC = 'starkware.cairo.common.alloc';
const STARKWARE_CAIRO_COMMON_CAIROBUILTINS = 'starkware.cairo.common.cairo_builtins';
const STARKWARE_CAIRO_COMMON_DICT = 'starkware.cairo.common.dict';
const STARKWARE_CAIRO_COMMON_MATH_CMP = 'starkware.cairo.common.math_cmp';
const STARKWARE_CAIRO_COMMON_UINT256 = 'starkware.cairo.common.uint256';
const WARPLIB_MATHS_BYTES_ACCESS = 'warplib.maths.bytes_access';
const WARPLIB_MATHS_BYTES_CONVERSIONS = 'warplib.maths.bytes_conversions';
const WARPLIB_MATHS_EXTERNAL_INPUT_CHECK_ADDRESS = 'warplib.maths.external_input_check_address';
const WARPLIB_MATHS_EXTERNAL_INPUT_CHECK_BOOL = 'warplib.maths.external_input_check_bool';
const WARPLIB_MATHS_EXTERNAL_INPUT_CHECK_INTS = 'warplib.maths.external_input_check_ints';
const WARPLIB_MATHS_INT_CONVERSIONS = 'warplib.maths.int_conversions';
const WARPLIB_MATHS_UTILS = 'warplib.maths.utils';
const WARPLIB_DYNAMIC_ARRAYS_UTIL = 'warplib.dynamic_arrays_util';
const WARPLIB_MEMORY = 'warplib.memory';
const WARPLIB_KECCAK = 'warplib.keccak';

// Functions-Structs names to import
const ALLOC = 'alloc';
const BITWISE_BUILTIN = 'BitwiseBuiltin';
const BYTE256_AT_INDEX = 'byte256_at_index';
const DICT_WRITE = 'dict_write';
const UINT256 = 'Uint256';
const FELT_TO_UINT256 = 'felt_to_uint256';
const IS_LE_FELT = 'is_le_felt';
const NARROW_SAFE = 'narrow_safe';
const BYTE_ARRAY_TO_FELT_VALUE = 'byte_array_to_felt_value';
const BYTE_ARRAY_TO_UINT256_VALUE = 'byte_array_to_uint256_value';
const BYTES_TO_FELT_DYNAMIC_ARRAY = 'bytes_to_felt_dynamic_array';
const BYTES_TO_FELT_DYNAMIC_ARRAY_SPL = 'bytes_to_felt_dynamic_array_spl';
const BYTES_TO_FELT_DYNAMIC_ARRAY_SPL_WITHOUT_PADDING =
  'bytes_to_felt_dynamic_array_spl_without_padding';
const FIXED_BYTES256_TO_FELT_DYNAMIC_ARRAY = 'fixed_bytes256_to_felt_dynamic_array';
const FIXED_BYTES256_TO_FELT_DYNAMIC_ARRAY_SPL = 'fixed_bytes256_to_felt_dynamic_array_spl';
const FIXED_BYTES_TO_FELT_DYNAMIC_ARRAY = 'fixed_bytes_to_felt_dynamic_array';
const FELT_ARRAY_TO_WARP_MEMORY_ARRAY = 'felt_array_to_warp_memory_array';
const MEMORY_DYN_ARRAY_COPY = 'memory_dyn_array_copy';
const WM_ALLOC = 'wm_alloc';
const WM_DYN_ARRAY_LENGTH = 'wm_dyn_array_length';
const WM_INDEX_DYN = 'wm_index_dyn';
const WM_NEW = 'wm_new';
const WARP_KECCAK = 'warp_keccak';
const WARP_UINT256 = 'warp_uint256';
const WARP_BYTES_WIDEN = 'warp_bytes_widen';
const WARP_BYTES_WIDEN_256 = 'warp_bytes_widen_256';
const WARP_EXTERNAL_INPUT_CHECK_ADDRESS = 'warp_external_input_check_address';
const WARP_EXTERNAL_INPUT_CHECK_BOOL = 'warp_external_input_check_bool';
const DYNAMIC_ARRAY_COPY_FELT = 'dynamic_array_copy_felt';
const FIXED_BYTES_TO_DYNAMIC_ARRAY = 'fixed_bytes_to_dynamic_array';
const FIXED_BYTES256_TO_DYNAMIC_ARRAY = 'fixed_bytes256_to_dynamic_array';

function findExistingImport(name: string, node: SourceUnit) {
  const found = node.getChildrenBySelector(
    (n) => n instanceof CairoImportFunctionDefinition && n.name === name,
  );
  assert(found.length < 2, `Were found more than 1 import functions with name: ${name}.`);

  return found.length === 1 ? (found[0] as CairoImportFunctionDefinition) : undefined;
}

function isWarp_intN_to_intN(name: string) {
  var regex = new RegExp(`warp_int(${allBits})_to_int(${allBits})`, 'g');
  return matchRegex(name, regex);
}

function isWarp_external_input_check_intN(name: string) {
  var regex = new RegExp(`warp_external_input_check_int(${allBits})`, 'g');
  return matchRegex(name, regex);
}

function matchRegex(name: string, regex: RegExp) {
  const match = name.match(regex);
  return match !== null && match[0] === name;
}

function createAllocImportFuncDef(node: SourceUnit, ast: AST): CairoImportFunctionDefinition {
  const funcName = ALLOC;
  const path = STARKWARE_CAIRO_COMMON_ALLOC;
  const implicits = new Set<Implicits>();
  const params = createParameterList([], ast);
  const retParams = createParameterList([], ast);

  return createImportFuncFuncDefinition(funcName, path, implicits, params, retParams, ast, node);
}

function createBitwiseBuiltinImportFuncDef(
  node: SourceUnit,
  ast: AST,
): CairoImportFunctionDefinition {
  const structName = BITWISE_BUILTIN;
  const path = STARKWARE_CAIRO_COMMON_CAIROBUILTINS;

  return createImportStructFuncDefinition(structName, path, ast, node);
}

function createDictWriteImportFuncDef(node: SourceUnit, ast: AST): CairoImportFunctionDefinition {
  const funcName = DICT_WRITE;
  const path = STARKWARE_CAIRO_COMMON_DICT;
  const implicits = new Set<Implicits>([DICT_PTR]);
  const params = createParameterList([], ast);
  const retParams = createParameterList([], ast);

  return createImportFuncFuncDefinition(funcName, path, implicits, params, retParams, ast, node);
}

function createIsLeFeltImportFuncDef(node: SourceUnit, ast: AST): CairoImportFunctionDefinition {
  const funcName = IS_LE_FELT;
  const path = STARKWARE_CAIRO_COMMON_MATH_CMP;
  const implicits = new Set<Implicits>([RANGE_CHECK_PTR]);
  const params = createParameterList([], ast);
  const retParams = createParameterList([], ast);

  return createImportFuncFuncDefinition(funcName, path, implicits, params, retParams, ast, node);
}

function createUint256ImportFuncDef(node: SourceUnit, ast: AST): CairoImportFunctionDefinition {
  const structName = UINT256;
  const path = STARKWARE_CAIRO_COMMON_UINT256;

  return createImportStructFuncDefinition(structName, path, ast, node);
}

function createByte256AtIndexImportFuncDef(
  node: SourceUnit,
  ast: AST,
): CairoImportFunctionDefinition {
  const funcName = BYTE256_AT_INDEX;
  const path = WARPLIB_MATHS_BYTES_ACCESS;
  const implicits = new Set<Implicits>([BITWISE_PTR, RANGE_CHECK_PTR]);
  const params = createParameterList([], ast);
  const retParams = createParameterList([], ast);

  return createImportFuncFuncDefinition(funcName, path, implicits, params, retParams, ast, node);
}

function createWarpBytesWidenImportFuncDef(
  node: SourceUnit,
  ast: AST,
): CairoImportFunctionDefinition {
  const funcName = WARP_BYTES_WIDEN;
  const path = WARPLIB_MATHS_BYTES_CONVERSIONS;
  const implicits = new Set<Implicits>([]);
  const params = createParameterList([], ast);
  const retParams = createParameterList([], ast);

  return createImportFuncFuncDefinition(funcName, path, implicits, params, retParams, ast, node);
}

function createWarpBytesWiden256ImportFuncDef(
  node: SourceUnit,
  ast: AST,
): CairoImportFunctionDefinition {
  const funcName = WARP_BYTES_WIDEN_256;
  const path = WARPLIB_MATHS_BYTES_CONVERSIONS;
  const implicits = new Set<Implicits>([RANGE_CHECK_PTR]);
  const params = createParameterList([], ast);
  const retParams = createParameterList([], ast);

  return createImportFuncFuncDefinition(funcName, path, implicits, params, retParams, ast, node);
}

function createWarpExternalInputCheckAddressImportFuncDef(
  node: SourceUnit,
  ast: AST,
): CairoImportFunctionDefinition {
  const funcName = WARP_EXTERNAL_INPUT_CHECK_ADDRESS;
  const path = WARPLIB_MATHS_EXTERNAL_INPUT_CHECK_ADDRESS;
  const implicits = new Set<Implicits>([RANGE_CHECK_PTR]);
  const params = createParameterList([], ast);
  const retParams = createParameterList([], ast);

  return createImportFuncFuncDefinition(funcName, path, implicits, params, retParams, ast, node);
}

function createWarpExternalInputCheckBoolImportFuncDef(
  node: SourceUnit,
  ast: AST,
): CairoImportFunctionDefinition {
  const funcName = WARP_EXTERNAL_INPUT_CHECK_BOOL;
  const path = WARPLIB_MATHS_EXTERNAL_INPUT_CHECK_BOOL;
  const implicits = new Set<Implicits>([RANGE_CHECK_PTR]);
  const params = createParameterList([], ast);
  const retParams = createParameterList([], ast);

  return createImportFuncFuncDefinition(funcName, path, implicits, params, retParams, ast, node);
}

function createWarpExternalInputCheckIntNImportFuncDef(
  funcName: string,
  node: SourceUnit,
  ast: AST,
): CairoImportFunctionDefinition {
  const path = WARPLIB_MATHS_EXTERNAL_INPUT_CHECK_INTS;
  const implicits = new Set<Implicits>([RANGE_CHECK_PTR]);
  const params = createParameterList([], ast);
  const retParams = createParameterList([], ast);

  return createImportFuncFuncDefinition(funcName, path, implicits, params, retParams, ast, node);
}

function createWarpIntNToIntNImportFuncDef(
  funcName: string,
  node: SourceUnit,
  ast: AST,
): CairoImportFunctionDefinition {
  const path = WARPLIB_MATHS_INT_CONVERSIONS;
  const match = funcName.match(/warp_int[\d]+_to_int256+/g); // Those functions also use range_check_ptr as implicit
  const implicits =
    match !== null
      ? new Set<Implicits>([RANGE_CHECK_PTR, BITWISE_PTR])
      : new Set<Implicits>([BITWISE_PTR]);
  const params = createParameterList([], ast);
  const retParams = createParameterList([], ast);

  return createImportFuncFuncDefinition(funcName, path, implicits, params, retParams, ast, node);
}

function createWarpUint256ImportFuncDef(node: SourceUnit, ast: AST): CairoImportFunctionDefinition {
  const funcName = WARP_UINT256;
  const path = WARPLIB_MATHS_INT_CONVERSIONS;
  const implicits = new Set<Implicits>([RANGE_CHECK_PTR]);
  const params = createParameterList([], ast);
  const retParams = createParameterList([], ast);

  return createImportFuncFuncDefinition(funcName, path, implicits, params, retParams, ast, node);
}

function createFelt2Uint256ImportFuncDef(
  node: SourceUnit,
  ast: AST,
): CairoImportFunctionDefinition {
  const funcName = FELT_TO_UINT256;
  const path = WARPLIB_MATHS_UTILS;
  const implicits = new Set<Implicits>([RANGE_CHECK_PTR]);
  const params = createParameterList([], ast);
  const retParams = createParameterList([], ast);

  return createImportFuncFuncDefinition(funcName, path, implicits, params, retParams, ast, node);
}

function createNarrowSafeImportFuncDef(node: SourceUnit, ast: AST): CairoImportFunctionDefinition {
  const funcName = NARROW_SAFE;
  const path = WARPLIB_MATHS_UTILS;
  const implicits = new Set<Implicits>([RANGE_CHECK_PTR]);
  const params = createParameterList([], ast);
  const retParams = createParameterList([], ast);

  return createImportFuncFuncDefinition(funcName, path, implicits, params, retParams, ast, node);
}

function createByteArrayToFeltValueImportFuncDef(
  node: SourceUnit,
  ast: AST,
): CairoImportFunctionDefinition {
  const funcName = BYTE_ARRAY_TO_FELT_VALUE;
  const path = WARPLIB_DYNAMIC_ARRAYS_UTIL;
  const implicits = new Set<Implicits>([BITWISE_PTR, RANGE_CHECK_PTR, WARP_MEMORY]);
  const params = createParameterList([], ast);
  const retParams = createParameterList([], ast);

  return createImportFuncFuncDefinition(funcName, path, implicits, params, retParams, ast, node);
}

function createByteArrayToUint256ValueImportFuncDef(
  node: SourceUnit,
  ast: AST,
): CairoImportFunctionDefinition {
  const funcName = BYTE_ARRAY_TO_UINT256_VALUE;
  const path = WARPLIB_DYNAMIC_ARRAYS_UTIL;
  const implicits = new Set<Implicits>([BITWISE_PTR, RANGE_CHECK_PTR, WARP_MEMORY]);
  const params = createParameterList([], ast);
  const retParams = createParameterList([], ast);

  return createImportFuncFuncDefinition(funcName, path, implicits, params, retParams, ast, node);
}

function createBytesToFeltDynamicArrayImportFuncDef(
  node: SourceUnit,
  ast: AST,
): CairoImportFunctionDefinition {
  const funcName = BYTES_TO_FELT_DYNAMIC_ARRAY;
  const path = WARPLIB_DYNAMIC_ARRAYS_UTIL;
  const implicits = new Set<Implicits>([BITWISE_PTR, RANGE_CHECK_PTR, WARP_MEMORY]);
  const params = createParameterList([], ast);
  const retParams = createParameterList([], ast);

  return createImportFuncFuncDefinition(funcName, path, implicits, params, retParams, ast, node);
}

function createBytesToFeltDynamicArraySplImportFuncDef(
  node: SourceUnit,
  ast: AST,
): CairoImportFunctionDefinition {
  const funcName = BYTES_TO_FELT_DYNAMIC_ARRAY_SPL;
  const path = WARPLIB_DYNAMIC_ARRAYS_UTIL;
  const implicits = new Set<Implicits>([BITWISE_PTR, RANGE_CHECK_PTR, WARP_MEMORY]);
  const params = createParameterList([], ast);
  const retParams = createParameterList([], ast);

  return createImportFuncFuncDefinition(funcName, path, implicits, params, retParams, ast, node);
}

function createBytesToFeltDynamicArraySplWithoutPaddingImportFuncDef(
  node: SourceUnit,
  ast: AST,
): CairoImportFunctionDefinition {
  const funcName = BYTES_TO_FELT_DYNAMIC_ARRAY_SPL_WITHOUT_PADDING;
  const path = WARPLIB_DYNAMIC_ARRAYS_UTIL;
  const implicits = new Set<Implicits>([BITWISE_PTR, RANGE_CHECK_PTR, WARP_MEMORY]);
  const params = createParameterList([], ast);
  const retParams = createParameterList([], ast);

  return createImportFuncFuncDefinition(funcName, path, implicits, params, retParams, ast, node);
}

function createFixedBytes256ToFeltDynArrayImportFuncDef(
  node: SourceUnit,
  ast: AST,
): CairoImportFunctionDefinition {
  const funcName = FIXED_BYTES256_TO_FELT_DYNAMIC_ARRAY;
  const path = WARPLIB_DYNAMIC_ARRAYS_UTIL;
  const implicits = new Set<Implicits>([BITWISE_PTR, RANGE_CHECK_PTR, WARP_MEMORY]);
  const params = createParameterList([], ast);
  const retParams = createParameterList([], ast);

  return createImportFuncFuncDefinition(funcName, path, implicits, params, retParams, ast, node);
}

function createFixedBytes256ToFeltDynArraySplImportFuncDef(
  node: SourceUnit,
  ast: AST,
): CairoImportFunctionDefinition {
  const funcName = FIXED_BYTES256_TO_FELT_DYNAMIC_ARRAY_SPL;
  const path = WARPLIB_DYNAMIC_ARRAYS_UTIL;
  const implicits = new Set<Implicits>([BITWISE_PTR, RANGE_CHECK_PTR, WARP_MEMORY]);
  const params = createParameterList([], ast);
  const retParams = createParameterList([], ast);

  return createImportFuncFuncDefinition(funcName, path, implicits, params, retParams, ast, node);
}

function createFixedBytesToFeltDynArrayImportFuncDef(
  node: SourceUnit,
  ast: AST,
): CairoImportFunctionDefinition {
  const funcName = FIXED_BYTES_TO_FELT_DYNAMIC_ARRAY;
  const path = WARPLIB_DYNAMIC_ARRAYS_UTIL;
  const implicits = new Set<Implicits>([BITWISE_PTR, RANGE_CHECK_PTR, WARP_MEMORY]);
  const params = createParameterList([], ast);
  const retParams = createParameterList([], ast);

  return createImportFuncFuncDefinition(funcName, path, implicits, params, retParams, ast, node);
}

function createFeltArray2WarpMemoryArrayImportFuncDef(
  node: SourceUnit,
  ast: AST,
): CairoImportFunctionDefinition {
  const funcName = FELT_ARRAY_TO_WARP_MEMORY_ARRAY;
  const path = WARPLIB_DYNAMIC_ARRAYS_UTIL;
  const implicits = new Set<Implicits>([RANGE_CHECK_PTR, WARP_MEMORY]);
  const params = createParameterList([], ast);
  const retParams = createParameterList([], ast);

  return createImportFuncFuncDefinition(funcName, path, implicits, params, retParams, ast, node);
}

function createMemoryDynArrayCopyImportFuncDef(
  node: SourceUnit,
  ast: AST,
): CairoImportFunctionDefinition {
  const funcName = MEMORY_DYN_ARRAY_COPY;
  const path = WARPLIB_DYNAMIC_ARRAYS_UTIL;
  const implicits = new Set<Implicits>([BITWISE_PTR, RANGE_CHECK_PTR, WARP_MEMORY]);
  const params = createParameterList([], ast);
  const retParams = createParameterList([], ast);

  return createImportFuncFuncDefinition(funcName, path, implicits, params, retParams, ast, node);
}

function createDynamicArrayCopyFeltImportFuncDef(
  node: SourceUnit,
  ast: AST,
): CairoImportFunctionDefinition {
  const funcName = DYNAMIC_ARRAY_COPY_FELT;
  const path = WARPLIB_DYNAMIC_ARRAYS_UTIL;
  const implicits = new Set<Implicits>([RANGE_CHECK_PTR, WARP_MEMORY]);
  const params = createParameterList([], ast);
  const retParams = createParameterList([], ast);

  return createImportFuncFuncDefinition(funcName, path, implicits, params, retParams, ast, node);
}

function createFixedBytesToDynamicArrayImportFuncDef(
  node: SourceUnit,
  ast: AST,
): CairoImportFunctionDefinition {
  const funcName = FIXED_BYTES_TO_DYNAMIC_ARRAY;
  const path = WARPLIB_DYNAMIC_ARRAYS_UTIL;
  const implicits = new Set<Implicits>([BITWISE_PTR, RANGE_CHECK_PTR, WARP_MEMORY]);
  const params = createParameterList([], ast);
  const retParams = createParameterList([], ast);

  return createImportFuncFuncDefinition(funcName, path, implicits, params, retParams, ast, node);
}

function createFixedBytes256ToDynamicArrayImportFuncDef(
  node: SourceUnit,
  ast: AST,
): CairoImportFunctionDefinition {
  const funcName = FIXED_BYTES256_TO_DYNAMIC_ARRAY;
  const path = WARPLIB_DYNAMIC_ARRAYS_UTIL;
  const implicits = new Set<Implicits>([BITWISE_PTR, RANGE_CHECK_PTR, WARP_MEMORY]);
  const params = createParameterList([], ast);
  const retParams = createParameterList([], ast);

  return createImportFuncFuncDefinition(funcName, path, implicits, params, retParams, ast, node);
}

function createWMAllocImportFuncDef(node: SourceUnit, ast: AST): CairoImportFunctionDefinition {
  const funcName = WM_ALLOC;
  const path = WARPLIB_MEMORY;
  const implicits = new Set<Implicits>([RANGE_CHECK_PTR, WARP_MEMORY]);
  const params = createParameterList([], ast);
  const retParams = createParameterList([], ast);

  return createImportFuncFuncDefinition(funcName, path, implicits, params, retParams, ast, node);
}

function createWMDynArrayLengthImportFuncDef(
  node: SourceUnit,
  ast: AST,
): CairoImportFunctionDefinition {
  const funcName = WM_DYN_ARRAY_LENGTH;
  const path = WARPLIB_MEMORY;
  const implicits = new Set<Implicits>([WARP_MEMORY]);
  const params = createParameterList([], ast);
  const retParams = createParameterList([], ast);

  return createImportFuncFuncDefinition(funcName, path, implicits, params, retParams, ast, node);
}

function createWMIndexDynImportFuncDef(node: SourceUnit, ast: AST): CairoImportFunctionDefinition {
  const funcName = WM_INDEX_DYN;
  const path = WARPLIB_MEMORY;
  const implicits = new Set<Implicits>([RANGE_CHECK_PTR, WARP_MEMORY]);
  const params = createParameterList([], ast);
  const retParams = createParameterList([], ast);

  return createImportFuncFuncDefinition(funcName, path, implicits, params, retParams, ast, node);
}

function createWMNewImportFuncDef(node: SourceUnit, ast: AST): CairoImportFunctionDefinition {
  const funcName = WM_NEW;
  const path = WARPLIB_MEMORY;
  const implicits = new Set<Implicits>([RANGE_CHECK_PTR, WARP_MEMORY]);
  const params = createParameterList([], ast);
  const retParams = createParameterList([], ast);

  return createImportFuncFuncDefinition(funcName, path, implicits, params, retParams, ast, node);
}

function createWarpKeccakImportFuncDef(node: SourceUnit, ast: AST): CairoImportFunctionDefinition {
  const funcName = WARP_KECCAK;
  const path = WARPLIB_KECCAK;
  const implicits = new Set<Implicits>([RANGE_CHECK_PTR, BITWISE_PTR, WARP_MEMORY, KECCAK_PTR]);
  const params = createParameterList([], ast);
  const retParams = createParameterList([], ast);

  return createImportFuncFuncDefinition(funcName, path, implicits, params, retParams, ast, node);
}

function createImportFuncFuncDefinition(
  funcName: string,
  path: string,
  implicits: Set<Implicits>,
  params: ParameterList,
  retParams: ParameterList,
  ast: AST,
  node: SourceUnit,
): CairoImportFunctionDefinition {
  const id = ast.reserveId();
  const scope = node.id;
  var funcDef = new CairoImportFunctionDefinition(
    id,
    scope,
    funcName,
    path,
    false,
    implicits,
    params,
    retParams,
  );
  ast.setContextRecursive(funcDef);
  node.insertAtBeginning(funcDef);
  return funcDef;
}

function createImportStructFuncDefinition(
  structName: string,
  path: string,
  ast: AST,
  node: SourceUnit,
): CairoImportFunctionDefinition {
  const id = ast.reserveId();
  const scope = node.id;
  const implicits = new Set<Implicits>();
  const params = createParameterList([], ast);
  const retParams = createParameterList([], ast);
  var funcDef = new CairoImportFunctionDefinition(
    id,
    scope,
    structName,
    path,
    true,
    implicits,
    params,
    retParams,
  );
  ast.setContextRecursive(funcDef);
  node.insertAtBeginning(funcDef);
  return funcDef;
}

const allBits =
  '8|16|24|32|40|48|56|64|72|80|88|96|104|112|120|128|136|144|152|160|168|176|184|192|200|208|216|224|232|240|248|256';
