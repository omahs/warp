import assert from 'assert';
import { type } from 'os';
import {
  ASTNode,
  Block,
  ContractKind,
  Expression,
  FunctionKind,
  IntType,
  Literal,
  LiteralKind,
  Return,
  SourceUnit,
  Statement,
  TypeNode,
  VariableDeclaration,
} from 'solc-typed-ast';
import { AST } from '../ast/ast';
import { CairoContract, CairoFunctionDefinition } from '../ast/cairoNodes';
import { ASTMapper } from '../ast/mapper';
import { isReferenceType, safeGetNodeType, warning } from '../export';
import { printNode } from '../utils/astPrinter';
import { TranspileFailedError } from '../utils/errors';

// Development use only
export class UnsupportedWriters extends ASTMapper {
  static map(ast: AST): AST {
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
      throw new TranspileFailedError('Generated code is not supported yet');
    }

    if (ast.getImports(node).size > 0) {
      throwWarning('Imports are not defined yet');
    }

    node.children.forEach((child) => this.dispatchVisit(child, ast));
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

    node.children.forEach((child) => this.dispatchVisit(child, ast));
  }

  visitCairoFunctionDefinition(node: CairoFunctionDefinition, ast: AST): void {
    if (node.kind === FunctionKind.Constructor) {
      throwWarning("Contract's constructor definition is not yet defined");
    }

    if (node.kind === FunctionKind.Fallback) {
      throw new TranspileFailedError('Fallback function writer not implemented');
    }

    node.vParameters.vParameters.forEach((param) => this.checkType(param, ast));
    node.vReturnParameters.vParameters.forEach((param) => this.checkType(param, ast));

    if (node.vBody !== undefined) {
      this.dispatchVisit(node.vBody, ast);
    }
  }

  visitBlock(node: Block, ast: AST): void {
    node.vStatements.forEach((st) => this.dispatchVisit(st, ast));
  }

  visitReturn(node: Return, ast: AST): void {
    if (node.vExpression !== undefined) {
      this.dispatchVisit(node.vExpression, ast);
    }
  }

  visitLiteral(node: Literal, ast: AST): void {
    if (node.kind === LiteralKind.Number) {
      this.checkType(node, ast);
      return;
    }
    throw new TranspileFailedError('Writer not implemented for literals different than numbers');
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

  checkType(node: Expression | VariableDeclaration, ast: AST): void {
    const typeNode = safeGetNodeType(node, ast.compilerVersion);

    if (isReferenceType(typeNode)) {
      throw new TranspileFailedError(`Reference types are not supported (${printNode(node)})`);
    }

    if (typeNode instanceof IntType) {
      if (typeNode.nBits === 256) {
        throw new TranspileFailedError('u256 numbers are not supported yet');
      }
      throwWarning(
        `Numbers smaller than 256 bits are being defined as felt instead of u${
          typeNode.nBits
        } (${printNode(node)})`,
      );
    }
  }
}

function throwWarning(message: string) {
  console.log(`${warning('WARNING:')} ${message}`);
}
