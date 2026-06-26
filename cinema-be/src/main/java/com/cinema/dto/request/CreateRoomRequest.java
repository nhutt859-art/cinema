package com.cinema.dto.request;

import java.util.Map;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateRoomRequest {
    private String roomName;
    private int totalRows;
    private int totalColumns;
    private Map<String, UUID> rowSeatTypes;
}
