import { ASTNode, ContractKind, Expression, SourceUnit, Statement } from 'solc-typed-ast';
import { AST } from '../ast/ast';
import { CairoContract } from '../ast/cairoNodes';
import { ASTMapper } from '../ast/mapper';
import { printNode } from '../utils/astPrinter';
import { TranspileFailedError } from '../utils/errors';

// Development use only
export class UnsupportedWriters extends ASTMapper {
  static map(ast: AST): AST {
    // ast.imports.forEach((importMap) => {
    //   if (importMap.size > 0) {
    //     throw new TranspileFailedError('Imports are not supported');
    //   }
    // });

    ast.roots.forEach((sourceUnit) => {
      const mapper = new this();
      mapper.dispatchVisit(sourceUnit, ast);
    });

    return ast;
  }

  visitSourceUnit(node: SourceUnit, ast: AST): void {
    if (node.vStructs.length > 0) {
      throw new TranspileFailedError('Structs are not supported');
    }
    if (node.vEnums.length > 0) {
      throw new TranspileFailedError('Enums are not supported');
    }
    if (node.vVariables.length > 0) {
      throw new TranspileFailedError('Constants at file level are not supported');
    }
    if (
      ast
        .getUtilFuncGen(node)
        .getGeneratedCode()
        .match(/[a-zA-Z ]+/) !== null
    ) {
      throw new TranspileFailedError('Generated code is not supported');
    }
  }

  visitCairoContract(node: CairoContract, ast: AST): void {
    if (node.kind === ContractKind.Interface) {
      throw new TranspileFailedError('Interfaces are not supported');
    }

    if (node.vStructs.length > 0) {
      throw new TranspileFailedError('Structs are not supported');
    }

    if (node.vEnums.length > 0) {
      throw new TranspileFailedError('Enums are not supported');
    }

    if (node.dynamicStorageAllocations.size > 0) {
      throw new TranspileFailedError('Storage dyanmic variables are not supported');
    }

    if (node.staticStorageAllocations.size > 0) {
      throw new TranspileFailedError('Storage static variables are not supportd');
    }
  }

  commonVisit(node: ASTNode, _ast: AST): void {
    throw new TranspileFailedError(`Writer not implemented for ${printNode(node)}`);
  }

  visitStatement(node: Statement, _ast: AST): void {
    throw new TranspileFailedError(`Writer not implemented for ${printNode(node)}`);
  }

  visitExpression(node: Expression, _ast: AST): void {
    throw new TranspileFailedError(`Writer not implemented for ${printNode(node)}`);
  }
}
