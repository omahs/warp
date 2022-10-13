import { Block, FunctionDefinition, PragmaDirective, UncheckedBlock } from 'solc-typed-ast';
import { AST, ASTMapper } from '../export';

export class MakeUnchecked extends ASTMapper {
  visitPragmaDirective(node: PragmaDirective, ast: AST): void {
    const upgradedPragma = new PragmaDirective(ast.reserveId(), node.src, ['solidity', '^0.8.14']);
    ast.replaceNode(node, upgradedPragma);
  }

  visitFunctionDefinition(node: FunctionDefinition, ast: AST): void {
    //@ts-ignore
    const uncheckedBody = new UncheckedBlock(
      ast.reserveId(),
      '',
      node.vBody?.vStatements,
      undefined,
      node.raw,
    );
    const newBlock = new Block(ast.reserveId(), '', [uncheckedBody], node.documentation, node.raw);
    //@ts-ignore
    ast.replaceNode(node.vBody, newBlock);
  }
}
