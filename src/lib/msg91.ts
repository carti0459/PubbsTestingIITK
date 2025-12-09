interface MSG91Config {
  authKey: string;
  senderId: string;
  templateId: string;
  baseUrl: string;
}

interface SendOTPParams {
  mobile: string;
  templateId?: string;
}

interface MSG91Response {
  type: string;
  message: string;
  request_id?: string;
}

class MSG91Service {
  private config: MSG91Config;

  constructor() {
    this.config = {
      authKey: process.env.MSG91_AUTH_KEY || "",
      senderId: "PUBBS",
      templateId: "67600347d6fc057efe363f12",
      baseUrl: "https://control.msg91.com/api/v5",
    };
  }

  async sendOTP(params: SendOTPParams): Promise<MSG91Response> {
    try {
      const { mobile, templateId = this.config.templateId } = params;

      if (!this.config.authKey) {
        throw new Error("MSG91 Auth Key not configured");
      }

      const cleanMobile = mobile.replace(/^\+91/, "").replace(/^91/, "");

      const url = `https://control.msg91.com/api/v5/otp?otp_length=6&template_id=${templateId}&mobile=${cleanMobile}&authkey=${this.config.authKey}`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/JSON",
        },
      });

      const responseData = await response.json();

      if (response.status === 200) {
        return {
          type: "success",
          message: "OTP sent successfully",
          request_id: responseData.request_id,
        };
      } else {
        console.error("Failed to send OTP:", responseData);
        throw new Error(
          `MSG91 API Error: ${
            responseData.message || responseData.error || "Unknown error"
          }`
        );
      }
    } catch (error) {
      console.error("MSG91 Service Error:", error);
      throw error;
    }
  }

  async verifyOTP(mobile: string, otp: string): Promise<boolean> {
    try {
      if (!this.config.authKey) {
        throw new Error("MSG91 Auth Key not configured");
      }

      const cleanMobile = mobile.replace(/^\+91/, "").replace(/^91/, "");

      const url = `https://control.msg91.com/api/v5/otp/verify?otp=${otp}&mobile=91${cleanMobile}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          authkey: this.config.authKey,
        },
      });

      const responseData = await response.json();

      if (response.status === 200) {
        if (responseData.type === "success") {
          return true;
        } else {
          return false;
        }
      } else {
        console.error("Failed to verify OTP:", response.status, responseData);
        return false;
      }
    } catch (error) {
      console.error("MSG91 Verify Error:", error);
      return false;
    }
  }

  generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  isValidOTP(otp: string): boolean {
    return /^\d{6}$/.test(otp);
  }

  isValidMobile(mobile: string): boolean {
    const cleanMobile = mobile.replace(/^\+91/, "").replace(/^91/, "");
    return /^[6-9]\d{9}$/.test(cleanMobile);
  }
}

export const msg91Service = new MSG91Service();
export default msg91Service;
