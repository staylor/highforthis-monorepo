import type { SourceLocation } from "./HIR";
export declare enum ErrorSeverity {
    InvalidJS = "InvalidJS",
    InvalidReact = "InvalidReact",
    InvalidConfig = "InvalidConfig",
    CannotPreserveMemoization = "CannotPreserveMemoization",
    Todo = "Todo",
    Invariant = "Invariant"
}
export declare enum CompilerSuggestionOperation {
    InsertBefore = 0,
    InsertAfter = 1,
    Remove = 2,
    Replace = 3
}
export type CompilerSuggestion = {
    op: CompilerSuggestionOperation.InsertAfter | CompilerSuggestionOperation.InsertBefore | CompilerSuggestionOperation.Replace;
    range: [number, number];
    description: string;
    text: string;
} | {
    op: CompilerSuggestionOperation.Remove;
    range: [number, number];
    description: string;
};
export type CompilerErrorDetailOptions = {
    reason: string;
    description?: string | null | undefined;
    severity: ErrorSeverity;
    loc: SourceLocation | null;
    suggestions?: Array<CompilerSuggestion> | null | undefined;
};
export declare class CompilerErrorDetail {
    options: CompilerErrorDetailOptions;
    constructor(options: CompilerErrorDetailOptions);
    get reason(): CompilerErrorDetailOptions["reason"];
    get description(): CompilerErrorDetailOptions["description"];
    get severity(): CompilerErrorDetailOptions["severity"];
    get loc(): CompilerErrorDetailOptions["loc"];
    get suggestions(): CompilerErrorDetailOptions["suggestions"];
    printErrorMessage(): string;
    toString(): string;
}
export declare class CompilerError extends Error {
    details: Array<CompilerErrorDetail>;
    static invariant(condition: unknown, options: Omit<CompilerErrorDetailOptions, "severity">): asserts condition;
    static throwTodo(options: Omit<CompilerErrorDetailOptions, "severity">): never;
    static throwInvalidJS(options: Omit<CompilerErrorDetailOptions, "severity">): never;
    static throwInvalidReact(options: Omit<CompilerErrorDetailOptions, "severity">): never;
    static throwInvalidConfig(options: Omit<CompilerErrorDetailOptions, "severity">): never;
    static throw(options: CompilerErrorDetailOptions): never;
    constructor(...args: Array<any>);
    get message(): string;
    set message(_message: string);
    toString(): string;
    push(options: CompilerErrorDetailOptions): CompilerErrorDetail;
    pushErrorDetail(detail: CompilerErrorDetail): CompilerErrorDetail;
    hasErrors(): boolean;
    isCritical(): boolean;
}
