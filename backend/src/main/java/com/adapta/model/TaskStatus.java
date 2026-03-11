package com.adapta.model;

public enum TaskStatus {
    TODO("todo"),
    IN_PROGRESS("in-progress"),
    DONE("done"),
    BLOCKED("blocked");

    private final String value;
    TaskStatus(String value) { this.value = value; }
    public String getValue() { return value; }

    public static TaskStatus from(String s) {
        if (s == null) return TODO;
        return switch (s.toLowerCase().replace(" ", "-")) {
            case "in-progress", "inprogress" -> IN_PROGRESS;
            case "done"                       -> DONE;
            case "blocked"                    -> BLOCKED;
            default                           -> TODO;
        };
    }
}
