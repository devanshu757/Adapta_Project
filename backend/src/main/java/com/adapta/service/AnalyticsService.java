package com.adapta.service;

import com.adapta.model.TaskStatus;
import com.adapta.repository.TaskRepository;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class AnalyticsService {

    private final TaskRepository taskRepository;

    public AnalyticsService(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    public Map<String, Object> getKpis() {
        long total      = taskRepository.count();
        long done       = taskRepository.countByStatus(TaskStatus.DONE);
        long inProgress = taskRepository.countByStatus(TaskStatus.IN_PROGRESS);
        long todo       = taskRepository.countByStatus(TaskStatus.TODO);
        long blocked    = taskRepository.countByStatus(TaskStatus.BLOCKED);

        Map<String, Object> kpis = new LinkedHashMap<>();
        kpis.put("total_tasks",  total);
        kpis.put("done",         done);
        kpis.put("in_progress",  inProgress);
        kpis.put("todo",         todo);
        kpis.put("blocked",      blocked);
        kpis.put("completion_pct", total > 0 ? Math.round((double) done / total * 100) : 0);
        return kpis;
    }
}
