package admin_usecase

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/xuri/excelize/v2"

	"swd392-chatbot-rag/internal/domain/user"
)

func (uc *AdminUseCase) BlockOrUnblockUser(ctx context.Context, userID uuid.UUID, block bool) error {
	u, err := uc.userRepo.FindByID(ctx, userID)
	if err != nil {
		return err
	}
	if u == nil {
		return errors.New("không tìm thấy người dùng")
	}

	u.IsBlocked = block
	u.IsActive = !block
	return uc.userRepo.Update(ctx, u)
}

func (uc *AdminUseCase) GetUsers(ctx context.Context) ([]*user.User, error) {
	return uc.userRepo.FindAll(ctx)
}

func (uc *AdminUseCase) ImportExcelUsers(ctx context.Context, fileReader io.Reader, adminAuthToken string) (int, []string, error) {
	f, err := excelize.OpenReader(fileReader)
	if err != nil {
		return 0, nil, fmt.Errorf("failed to open excel file: %w", err)
	}
	defer f.Close()

	// Get the first sheet name
	sheetMap := f.GetSheetMap()
	if len(sheetMap) == 0 {
		return 0, nil, errors.New("no sheets found in the excel file")
	}
	firstSheet := sheetMap[1]

	rows, err := f.GetRows(firstSheet)
	if err != nil {
		return 0, nil, fmt.Errorf("failed to get rows: %w", err)
	}

	if len(rows) <= 1 {
		return 0, nil, errors.New("excel file is empty or contains only headers")
	}

	successCount := 0
	var errorMessages []string

	// Expected columns: Email, Name, Username, RoleId
	for i, row := range rows {
		if i == 0 {
			continue // Skip header
		}

		if len(row) < 4 {
			errorMessages = append(errorMessages, fmt.Sprintf("Row %d is incomplete", i+1))
			continue
		}

		email := strings.TrimSpace(row[0])
		name := strings.TrimSpace(row[1])
		username := strings.TrimSpace(row[2])
		roleIdStr := strings.TrimSpace(row[3])

		if email == "" || name == "" || username == "" || roleIdStr == "" {
			errorMessages = append(errorMessages, fmt.Sprintf("Row %d has empty fields", i+1))
			continue
		}

		// Prepare POST request to Hono Server
		payload := map[string]interface{}{
			"email":    email,
			"password": "Password123!",
			"name":     name,
			"username": username,
			"roleId":   roleIdStr,
		}

		payloadBytes, _ := json.Marshal(payload)
		req, err := http.NewRequestWithContext(ctx, "POST", "http://localhost:5000/api/admin/users", bytes.NewBuffer(payloadBytes))
		if err != nil {
			errorMessages = append(errorMessages, fmt.Sprintf("Row %d: internal error creating request", i+1))
			continue
		}

		req.Header.Set("Content-Type", "application/json")
		if adminAuthToken != "" {
			req.Header.Set("Authorization", adminAuthToken)
		}

		client := &http.Client{Timeout: 10 * time.Second}
		resp, err := client.Do(req)
		if err != nil {
			errorMessages = append(errorMessages, fmt.Sprintf("Row %d: failed to connect to auth server: %v", i+1, err))
			continue
		}

		if resp.StatusCode >= 200 && resp.StatusCode < 300 {
			successCount++
		} else {
			body, _ := io.ReadAll(resp.Body)
			var errResp map[string]interface{}
			json.Unmarshal(body, &errResp)
			errMsg := "unknown error"
			if msg, ok := errResp["error"].(string); ok {
				errMsg = msg
			}
			errorMessages = append(errorMessages, fmt.Sprintf("Row %d (%s): %s", i+1, email, errMsg))
		}
		resp.Body.Close()
	}

	return successCount, errorMessages, nil
}
